In each json files: you will find three type of fields: 

    "question_number": "1",
    "answer_found_by_llm": "Yes, there is clear evidence of port scanning in the network traffic. The IP address 87.96.21.84 is responsible for the scanning activity. This is evidenced by its numerous connection attempts to multiple ports (including 707 connections to port 63317, 501 connections to port 1433, and multiple connections to sequential ports 64291, 64284, 64294, 64287, and 64293), along with 1236 SYN packets indicating connection attempts.",
    "result": "1"


    "question_number" : to identify the question number from the SIA dataset
    "answer_found_by_llm": The answer that LLM provided to us
    "result" : 0,1,"Given up on the/this question", "Round exceed the limit"

for result where the value is 0 or 1, you will show the answer from the "answer_found_by_llm" field. 

for result "Given up one the/this question", show that "LLM has given up on this question" (try to use something like string.contains (given, give) to find the matches)

for result "Round exceed the limit", show that "LLM couldn't find the answer in given number of attempts" (try to use something like string.contains (round, Round) to find the matches)