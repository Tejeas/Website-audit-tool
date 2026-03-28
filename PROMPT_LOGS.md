# Prompt Logs

This document captures how the AI analysis part of the system was developed and improved over time.

Note: During early development, I experimented with a real AI API. However, the final version of the system uses a local rule-based analysis module due to time and API cost constraints.

---

## Initial Approach

At the start, the goal was to take scraped website data (text, headings, images, etc.) and generate useful feedback using an AI model.

The idea was simple:
- Extract key metrics
- Send them to the AI
- Get back structured insights

---

## Iteration 1 – Basic Prompt (Too Generic)

**Time:** ~1:30pm

**Prompt used:**

Analyze this website and give feedback:
- Word count: 300
- Headings: 2
- Images: 1

---

**Output (example):**

- Improve SEO
- Add more content
- Use better headings

---

**Notes:**

The output was too generic and not very useful. It didn’t really take advantage of the metrics I was passing.

At this point it felt like the AI was just giving general advice instead of actually analyzing the data.

---

## Iteration 2 – More Structured Prompt

**Time:** ~2:15pm

I tried making the prompt more structured so the AI would give more specific responses.

---

**Prompt used:**

Analyze the following website data and give practical feedback.

Metrics:
- Word count: 320
- Headings: 2
- Images: 1
- CTA buttons: 0

Give:
1. A quality score out of 100  
2. Strengths  
3. Weaknesses  
4. Suggestions  

Keep the response concise and based on the metrics.

---

**Output (example):**

Score: 52/100  

Strengths:
- Some structured content using headings  

Weaknesses:
- Low word count limits content depth  
- Very few headings reduce readability  
- No call-to-action elements  

Suggestions:
- Increase content length  
- Add more headings  
- Include CTA buttons  

---

**Notes:**

This was definitely better than the first attempt.

The output became more structured and somewhat relevant to the data.

However, it still felt a bit “template-like” and not very insightful.  
Also noticed that results varied depending on the website.

I had to tweak the wording a few times to get something decent.

---

## Iteration 3 – Guiding the AI More Clearly

**Time:** ~3:30pm

At this point I realized the AI needed more direction to produce useful insights.

So I tried making the prompt more explicit and focused on actionable feedback.

---

**Prompt used:**

You are analyzing a website based on the following metrics.

Metrics:
- Word count: 450  
- Headings: 3  
- Images: 2  
- CTA buttons: 1  

Evaluate the website and provide:

1. A score out of 100  
2. Key strengths  
3. Key weaknesses  
4. Specific recommendations  

Focus on practical improvements and refer to the metrics provided.

---

**Output (example):**

Score: 65/100  

Strengths:
- Moderate content length  
- Some use of headings  

Weaknesses:
- Content still lacks depth  
- Limited visual elements  
- Weak call-to-action presence  

Recommendations:
- Expand content for better engagement  
- Add more structured sections  
- Improve CTA visibility and placement  

---

**Notes:**

This version worked much better.

The responses were more aligned with the input data and gave clearer suggestions.

Still not perfect, but good enough to understand how the system should behave.

---

## Challenges Faced

- Initial prompts produced very generic responses  
- Needed multiple attempts to get meaningful output  
- Some outputs were inconsistent depending on the website  
- Scraped content wasn’t always clean, which affected results  

---

## Final Implementation Decision

Due to API limitations and time constraints, I replaced the live AI integration with a rule-based analysis module.

This module:
- Uses extracted metrics  
- Applies simple logic to generate feedback  
- Mimics the structure of AI responses  

The prompt design and experiments above were still useful in shaping how the final output is structured.

---

## Summary

The main learning from this process was that prompt design has a big impact on output quality.

Even small changes in wording or structure can significantly affect how useful the results are.

Although the final system does not use a live AI API, the design is ready for integration in the future.