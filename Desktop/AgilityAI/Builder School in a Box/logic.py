import json
import os
import re
from typing import List
import streamlit as st
from openai import OpenAI
from pydantic import ValidationError
from schema import StartupPlan


def _clean_reasoning_output(content: str) -> str:
    """Clean DeepSeek-R1 reasoning tokens from output."""
    # Remove thinking tags and their content
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
    # Remove any remaining HTML-like tags
    content = re.sub(r'<[^>]+>', '', content)
    # Clean up extra whitespace
    content = content.strip()
    return content


def _get_openai_client():
    """Initialize OpenAI client for OpenRouter."""
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=st.secrets['OPENROUTER_API_KEY'],
    )


def _system_prompt(grade: int, category: str) -> str:
    return (
        "Generate a startup plan as a JSON object with the following schema: "
        "{\"name\": string, \"problem\": string, \"audience\": string, \"features\": [string], \"revenue\": string, \"roadmap\": [string]}. "
        f"Use vocabulary and sentence length appropriate for grade {grade}. "
        f"Category context: {category}. "
        "Make sure all fields are present and arrays contain multiple items."
    )


def architect_agent(idea: str, grade: int, category: str) -> StartupPlan:
    client = _get_openai_client()
    
    messages = [
        {"role": "system", "content": _system_prompt(grade, category)},
        {"role": "user", "content": f"Idea: {idea}"},
    ]
    
    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=messages,
            temperature=0.3,
            extra_headers={
                "HTTP-Referer": "http://localhost:8501",
                "X-Title": "Builder School in a Box",
            },
        )
        
        content = response.choices[0].message.content
        # Clean reasoning tokens
        content = _clean_reasoning_output(content)
        
        # Parse JSON
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            # Try to extract JSON from the content
            match = re.search(r'\{[\s\S]*\}', content)
            if match:
                data = json.loads(match.group(0))
            else:
                raise ValueError("No valid JSON found in response")
        
        return StartupPlan(**data)
    except ValidationError as e:
        raise ValueError(f"Schema validation error: {str(e)}") from e
    except Exception as e:
        raise RuntimeError(f"Failed to generate startup plan: {str(e)}") from e


def mentor_agent(plan: StartupPlan, answers: dict) -> str:
    client = _get_openai_client()
    
    prompt = f"""
    Based on this startup plan and the student's answers, provide personalized mentorship advice:
    
    Startup Plan:
    Name: {plan.name}
    Problem: {plan.problem}
    Audience: {plan.audience}
    Features: {', '.join(plan.features)}
    Revenue: {plan.revenue}
    Roadmap: {', '.join(plan.roadmap)}
    
    Student Answers:
    {json.dumps(answers, indent=2)}
    
    Provide constructive feedback and next steps. Be encouraging but realistic.
    """
    
    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "http://localhost:8501",
                "X-Title": "Builder School in a Box",
            },
        )
        
        content = response.choices[0].message.content
        return _clean_reasoning_output(content)
    except Exception as e:
        raise RuntimeError(f"Failed to generate mentorship advice: {str(e)}") from e


def forge_agent(plan: StartupPlan) -> str:
    client = _get_openai_client()
    
    prompt = f"""
    Create a complete, modern HTML landing page for a startup with these details:
    
    Name: {plan.name}
    Problem: {plan.problem}
    Target Audience: {plan.audience}
    Key Features: {', '.join(plan.features[:3])}
    Revenue Model: {plan.revenue}
    
    Requirements:
    - Use Tailwind CSS via CDN
    - Dark theme with modern design
    - Include hero section, features section, and call-to-action
    - Make it responsive and visually appealing
    - Use semantic HTML5 tags
    - Add smooth hover effects and transitions
    - Include a navigation header
    
    Return ONLY the complete HTML code (no explanations, no markdown fences).
    """
    
    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "http://localhost:8501",
                "X-Title": "Builder School in a Box",
            },
        )
        
        content = response.choices[0].message.content
        # Clean reasoning tokens and any markdown fences
        content = _clean_reasoning_output(content)
        content = re.sub(r'```html\s*', '', content)
        content = re.sub(r'```\s*$', '', content)
        return content.strip()
    except Exception as e:
        raise RuntimeError(f"Failed to generate HTML prototype: {str(e)}") from e


# Legacy functions for backward compatibility
def get_mentor_questions(plan: StartupPlan) -> List[str]:
    return [
        "What makes this problem urgent for your audience?",
        "Which feature delivers the earliest measurable value?",
        "How will you test willingness to pay for the solution?",
    ]


def get_architect_response(idea: str, grade: int, category: str) -> StartupPlan:
    return architect_agent(idea, grade, category)
