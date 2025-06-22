import app.database
from decimal import Decimal
import psycopg2
import os

DISPLAYED_MODELS = [
    "Llama3.1-8B", "Llama3.1-70B", "Llama3.1-405B",
    "GPT-4.0", "GPT-4.0mini", "Gemini1.5-pro",
    "DeepSeek-Reasoner", "OpenAI-o3-mini", "Claude-3.5"
]

CATEGORY_CODES = {
    "Network Forensics": "NF",
    "Disk & Memory Forensics": "DMF",
    "Malware Analysis": "MA",
    "Others": "MS"
}

LEVEL_CODES = {
    "Easy": "E",
    "Medium": "M",
    "Hard": "H"
}


def to_int(val):
    return int(val) if val is not None else 0


def to_float(val):
    return float(val) if val is not None else 0.0


LEADERBOARD_SQL = """
WITH
  all_qs AS (
    SELECT question_id, scenario_name
    FROM question_metadata
  ),
  filtered_qs AS (
    SELECT question_id, scenario_name
    FROM question_metadata
    WHERE (%s::text[] IS NULL OR task_category = ANY(%s))
      AND (%s::text[] IS NULL OR question_level = ANY(%s))
  ),
  all_per_scenario AS (
    SELECT
      m.model_name,
      aq.scenario_name,
      COUNT(aq.question_id) AS num_questions,
      COUNT(mm.metrics_id) FILTER (WHERE mm.response = 'pass') AS num_passed
    FROM all_qs aq
      CROSS JOIN models m
      LEFT JOIN model_metrics mm
        ON mm.question_id = aq.question_id
       AND mm.model_id = m.model_id
    GROUP BY m.model_name, aq.scenario_name
  ),
  all_scenario_stats AS (
    SELECT
      model_name,
      AVG(
        CASE
          WHEN num_questions > 0 THEN num_passed::float / num_questions
          ELSE 0
        END
      ) AS overall_solving_percentage,
      SUM(
        CASE
          WHEN num_questions > 0 AND num_passed = num_questions THEN 1
          ELSE 0
        END
      ) AS overall_fully_solved
    FROM all_per_scenario
    GROUP BY model_name
  ),
  filtered_per_scenario AS (
    SELECT
      m.model_name,
      fq.scenario_name,
      COUNT(fq.question_id) AS num_questions,
      COUNT(mm.metrics_id) FILTER (WHERE mm.response = 'pass') AS num_passed
    FROM filtered_qs fq
      CROSS JOIN models m
      LEFT JOIN model_metrics mm
        ON mm.question_id = fq.question_id
       AND mm.model_id = m.model_id
    GROUP BY m.model_name, fq.scenario_name
  ),
  filtered_scenario_stats AS (
    SELECT
      model_name,
      AVG(
        CASE
          WHEN num_questions > 0 THEN num_passed::float / num_questions
          ELSE 0
        END
      ) AS filtered_solving_percentage,
      SUM(
        CASE
          WHEN num_questions > 0 AND num_passed = num_questions THEN 1
          ELSE 0
        END
      ) AS filtered_fully_solved
    FROM filtered_per_scenario
    GROUP BY model_name
  ),
  filtered_scenarios_ct AS (
    SELECT COUNT(DISTINCT scenario_name) AS total_filtered_scenarios
    FROM filtered_qs
  ),
  all_scenarios_ct AS (
    SELECT COUNT(DISTINCT scenario_name) AS total_scenarios
    FROM all_qs
  )
SELECT
  m.model_name,
  COALESCE(ass.overall_fully_solved, 0) AS overall_fully_solved,
  COALESCE(
    ROUND(CAST(100.0 * ass.overall_solving_percentage AS numeric), 2),
    0
  ) AS overall_solving_percentage,
  COALESCE(fss.filtered_fully_solved, 0) AS filtered_fully_solved,
  COALESCE(
    ROUND(CAST(100.0 * fss.filtered_solving_percentage AS numeric), 2),
    0
  ) AS filtered_solving_percentage,
  fsct.total_filtered_scenarios      AS total_filtered_scenarios,
  asct.total_scenarios               AS total_scenarios
FROM models m
LEFT JOIN all_scenario_stats ass
  ON ass.model_name = m.model_name
LEFT JOIN filtered_scenario_stats fss
  ON fss.model_name = m.model_name
LEFT JOIN filtered_scenarios_ct fsct ON TRUE
LEFT JOIN all_scenarios_ct       asct ON TRUE
ORDER BY overall_solving_percentage DESC;
"""


DETAILED_BREAKDOWN_SQL = """
WITH
  code_qs AS (
    SELECT
      question_id,
      scenario_name,
      CONCAT(
        CASE task_category
          WHEN 'Network Forensics' THEN 'NF'
          WHEN 'Disk & Memory Forensics' THEN 'DMF'
          WHEN 'Malware Analysis' THEN 'MA'
          ELSE 'MS'
        END,
        '-',
        CASE question_level
          WHEN 'Easy' THEN 'E'
          WHEN 'Medium' THEN 'M'
          WHEN 'Hard' THEN 'H'
          ELSE 'E'
        END
      ) AS code
    FROM question_metadata
  ),
  per_model_code_scenario AS (
    SELECT
      m.model_name,
      cq.code,
      cq.scenario_name,
      COUNT(cq.question_id) AS num_questions,
      COUNT(mm.metrics_id) FILTER (WHERE mm.response = 'pass') AS num_passed
    FROM code_qs cq
      CROSS JOIN models m
      LEFT JOIN model_metrics mm
        ON mm.question_id = cq.question_id
       AND mm.model_id = m.model_id
    GROUP BY m.model_name, cq.code, cq.scenario_name
  ),
  code_scenario_stats AS (
    SELECT
      model_name,
      code,
      COUNT(*) AS total_scenarios,
      SUM(
        CASE
          WHEN num_questions > 0 AND num_passed = num_questions THEN 1
          ELSE 0
        END
      ) AS fully_solved,
      AVG(
        CASE
          WHEN num_questions > 0 THEN num_passed::float / num_questions
          ELSE 0
        END
      ) AS solving_percentage
    FROM per_model_code_scenario
    GROUP BY model_name, code
  )
SELECT
  model_name,
  code,
  fully_solved,
  total_scenarios,
  ROUND(CAST(100.0 * solving_percentage AS numeric), 2) AS solving_percentage
FROM code_scenario_stats
ORDER BY model_name, code;
"""

AT_LEADERBOARD_SQL = """
WITH
  all_qs AS (
    SELECT at_question_id, at_scenario_name
      FROM at_metadata
  ),
  filtered_qs AS (
    SELECT at_question_id, at_scenario_name
      FROM at_metadata
     WHERE (%s::text[] IS NULL OR at_task_category = ANY(%s))
       AND (%s::text[] IS NULL OR at_question_level  = ANY(%s))
  ),
  all_per_scenario AS (
    SELECT m.model_name
         , aq.AT_scenario_name    AS scenario_name
         , COUNT(aq.at_question_id) AS num_questions
         , COUNT(mm.at_metrics_id) FILTER (WHERE mm.at_response = 'pass') AS num_passed
      FROM all_qs aq
 CROSS JOIN models m
 LEFT JOIN at_model_metrics mm
        ON mm.at_question_id = aq.at_question_id
       AND mm.model_id       = m.model_id
  GROUP BY m.model_name, aq.AT_scenario_name
  ),
  all_scenario_stats AS (
    SELECT
      model_name,
      AVG(
        CASE WHEN num_questions > 0
             THEN num_passed::float/num_questions
             ELSE 0
        END
      ) AS overall_solving_percentage,
      SUM(
        CASE WHEN num_questions>0 AND num_passed=num_questions
             THEN 1
             ELSE 0
        END
      ) AS overall_fully_solved
    FROM all_per_scenario
    GROUP BY model_name
  ),
  filtered_per_scenario AS (
    SELECT m.model_name
         , fq.AT_scenario_name AS scenario_name
         , COUNT(fq.at_question_id) AS num_questions
         , COUNT(mm.at_metrics_id) FILTER (WHERE mm.at_response='pass') AS num_passed
      FROM filtered_qs fq
 CROSS JOIN models m
 LEFT JOIN at_model_metrics mm
        ON mm.at_question_id = fq.at_question_id
       AND mm.model_id       = m.model_id
    GROUP BY m.model_name, fq.at_scenario_name
  ),
  filtered_scenario_stats AS (
    SELECT
      model_name,
      AVG(
        CASE WHEN num_questions>0
             THEN num_passed::float/num_questions
             ELSE 0
        END
      ) AS filtered_solving_percentage,
      SUM(
        CASE WHEN num_questions>0 AND num_passed=num_questions
             THEN 1
             ELSE 0
        END
      ) AS filtered_fully_solved
    FROM filtered_per_scenario
    GROUP BY model_name
  ),
  filtered_scenarios_ct AS (
    SELECT COUNT(DISTINCT at_scenario_name) AS total_filtered_scenarios
      FROM filtered_qs
  ),
  all_scenarios_ct AS (
    SELECT COUNT(DISTINCT at_scenario_name) AS total_scenarios
      FROM all_qs
  )
SELECT
  m.model_name,
  COALESCE(ass.overall_fully_solved,0)              AS overall_fully_solved,
  COALESCE(ROUND(CAST(100.0*ass.overall_solving_percentage AS numeric),2),0) AS overall_solving_percentage,
  COALESCE(fss.filtered_fully_solved,0)             AS filtered_fully_solved,
  COALESCE(ROUND(CAST(100.0*fss.filtered_solving_percentage AS numeric),2),0) AS filtered_solving_percentage,
  fsct.total_filtered_scenarios,
  asct.total_scenarios
FROM models m
LEFT JOIN all_scenario_stats    ass ON ass.model_name    = m.model_name
LEFT JOIN filtered_scenario_stats fss ON fss.model_name   = m.model_name
LEFT JOIN filtered_scenarios_ct fsct ON TRUE
LEFT JOIN all_scenarios_ct       asct ON TRUE
ORDER BY overall_solving_percentage DESC;
"""

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"], sslmode="require")

def fetch_task_options():
    with get_conn() as conn:
      with conn.cursor() as cur:
        cur.execute("SELECT DISTINCT task_category FROM question_metadata")
        return [row[0] for row in cur.fetchall()]


def fetch_level_options():
    with get_conn() as conn:
      with conn.cursor() as cur:
        cur.execute("SELECT DISTINCT question_level FROM question_metadata")
        return [row[0] for row in cur.fetchall()]


def fetch_leaderboard(tasks=None, levels=None):
    t_param = tasks if tasks else None
    l_param = levels if levels else None
    params = (t_param, t_param, l_param, l_param)

    with get_conn() as conn:
      with conn.cursor() as cur:
        cur.execute(LEADERBOARD_SQL, params)
        rows = cur.fetchall()

    result = []
    for model_name, overall_solved, overall_pct, filtered_solved, filtered_pct,total_filtered,total_scenarios in rows:
        result.append({
            "model_name": model_name,
            "overall_fully_solved": to_int(overall_solved),
            "overall_solving_percentage": to_float(overall_pct),
            "filtered_fully_solved": to_int(filtered_solved),
            "filtered_solving_percentage": to_float(filtered_pct),
            "total_filtered_scenarios": to_int(total_filtered),
            "total_scenarios": to_int(total_scenarios),
        })
    return result

def fetch_passed_questions(model_name):
    query = """
        SELECT q.question_id, q.scenario_name, q.question, q.answer, q.adversarial_tactic
        FROM question_metadata q
        JOIN model_metrics m ON m.question_id = q.question_id
        JOIN models mod ON mod.model_id = m.model_id
        WHERE m.model_name = %s AND m.response = 'pass'
        ORDER BY q.scenario_name, q.question_id;
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (model_name,))
            rows = cur.fetchall()
    results = []
    for row in rows:
        results.append({
            "scenario_name": row[1],
            "question": row[2],
            "answer": row[3],
            "adversarial_tactic": row[4]
        })
    return results


def fetch_latest(tasks=None, levels=None, latest_model="GPT-4.0"):

    all_entries = fetch_leaderboard(tasks, levels)
    return [entry for entry in all_entries if entry["model_name"] == latest_model]


def fetch_detailed_breakdown():

    with get_conn() as conn:
      with conn.cursor() as cur:
        cur.execute(DETAILED_BREAKDOWN_SQL)
        rows = cur.fetchall()

    model_breakdown = {}
    for model_name, code, fully_solved, total_scenarios, solving_pct in rows:
        if model_name not in model_breakdown:
            model_breakdown[model_name] = {}
        model_breakdown[model_name][code] = {
            "solved": to_int(fully_solved),
            "total": to_int(total_scenarios),
            "percentage": to_float(solving_pct),
        }

    result = []
    for m in DISPLAYED_MODELS:
        if m in model_breakdown:
            result.append({
                "model_name": m,
                "breakdown": model_breakdown[m]
            })
    return result

def fetch_legend():
    legend = []
    legend.append({"code": "FS", "meaning": "Fully solved scenarios"})

    for category, code in CATEGORY_CODES.items():
        legend.append({"code": code, "meaning": category})

    for level, code in LEVEL_CODES.items():
        legend.append({"code": code, "meaning": level})

    return legend

def fetch_alert_leaderboard(tasks=None, levels=None):
    t_param = tasks if tasks else None
    l_param = levels if levels else None
    params = (t_param, t_param, l_param, l_param)
    
    with get_conn() as conn:
      with conn.cursor() as cur:
        cur.execute(AT_LEADERBOARD_SQL, params)
        rows = cur.fetchall()

    result = []
    for model_name, overall_solved, overall_pct, filtered_solved, filtered_pct,total_filtered,total_scenarios in rows:
        result.append({
            "model_name": model_name,
            "overall_fully_solved":    to_int(overall_solved),
            "overall_solving_percentage": to_float(overall_pct),
            "filtered_fully_solved":   to_int(filtered_solved),
            "filtered_solving_percentage": to_float(filtered_pct),
            "total_filtered_scenarios": to_int(total_filtered),
            "total_scenarios":         to_int(total_scenarios),
        })
    return result


def fetch_model_integrations(): 
    return [
       
        {
            "model_name": "Llama3.1-8B",
            "provider":   "Meta",
            "api":        "Fireworks API",
            "api_url":    "https://fireworks.ai/models"     
        },
        {
            "model_name": "Llama3.1-70B",
            "provider":   "Meta",
            "api":        "Fireworks API",
            "api_url":    "https://fireworks.ai/models"
        },
        {
            "model_name": "Llama3.1-405B", 
            "provider": "Meta",     
            "api": "Fireworks API",
            "api_url":    "https://fireworks.ai/models"
        },
        {
            "model_name": "GPT-4.0",
            "provider":   "OpenAI",
            "api":        "OpenAI API",
            "api_url":    "https://platform.openai.com/docs/overview"
        },
        {
            "model_name": "GPT-4.0mini",
            "provider":   "OpenAI",
            "api":        "OpenAI API",
            "api_url":    "https://platform.openai.com/docs/overview"
        },
        {
            "model_name": "Gemini1.5-pro",
            "provider":   "Google",
            "api":        "Google Gemini API",
            "api_url":    "https://ai.google.dev/"
        },
        {
            "model_name": "DeepSeek-Reasoner",
            "provider":   "DeepSeek",
            "api":        "DeepSeek API",
            "api_url":    "https://fireworks.ai/models"
        },
        {
            "model_name": "OpenAI-o3-mini",
            "provider":   "OpenAI",
            "api":        "OpenAI API",
            "api_url":    "https://platform.openai.com/docs/overview"
        },
        {
            "model_name": "Claude-3.5",
            "provider":   "Anthropic",
            "api":        "Claude API",
            "api_url":    "https://docs.anthropic.com/en/docs/about-claude/models/all-models"
        },
    ]
