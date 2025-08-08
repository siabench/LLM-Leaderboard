import React from "react";
import { getScenarios, getScenarioQuestions } from "../services/api";

export default function ScenariosTree() {
  const [scenarios, setScenarios] = React.useState([]);
  const [expanded, setExpanded] = React.useState({});
  const [questions, setQuestions] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getScenarios()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setScenarios(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleScenario = async (name) => {
    setExpanded((p) => ({ ...p, [name]: !p[name] }));
    if (!questions[name]) {
      try {
        const res = await getScenarioQuestions(name);
        setQuestions((p) => ({
          ...p,
          [name]: Array.isArray(res.data) ? res.data : [],
        }));
      } catch (e) {
        console.error(e);
        setQuestions((p) => ({ ...p, [name]: [] }));
      }
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

  return (
    <div className="p-4">
      <div className="font-semibold mb-2">Scenarios</div>
      {(scenarios ?? []).map((s) => {
        const name = s.scenario_name ?? s.name;
        const cat = s.task_category ?? s.category ?? "—";
        const lvl = s.question_level ?? s.level ?? s.levels?.join(", ") ?? "—";
        const isOpen = !!expanded[name];
        const qs = questions[name] ?? [];
        return (
          <div key={name} className="border rounded mb-2">
            <button
              onClick={() => toggleScenario(name)}
              className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">{name}</span>
              <span className="text-xs text-gray-500">
                {cat} • {lvl}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 py-2 border-t">
                {qs.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No questions found.
                  </div>
                ) : (
                  <ul className="list-disc pl-5">
                    {(qs ?? []).map((q, i) => (
                      <li key={q.question_id ?? i} className="text-sm">
                        {q.question ?? q.text ?? "(missing question text)"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
