import streamlit as st
from logic import architect_agent, forge_agent, get_mentor_questions
from schema import StartupPlan


st.set_page_config(page_title="Builder School in a Box", page_icon="🚀", layout="wide")
style = """
<style>
:root {
  --bg: #0b0f1a;
  --card: #121829;
  --text: #e6e8ef;
  --muted: #98a2b3;
  --accent: #7c3aed;
  --success: #10b981;
  --info: #3b82f6;
}
.app-container {padding: 0 1rem 2rem;}
.hero {padding: 1.5rem 2rem; border-radius: 16px; background: linear-gradient(140deg, rgba(124,58,237,.25), rgba(59,130,246,.18)); color: var(--text); border: 1px solid rgba(255,255,255,.08); margin-bottom: 1rem;}
.card {background: var(--card); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 1rem 1.25rem; color: var(--text);}
.badge {display: inline-block; padding: .35rem .6rem; border-radius: 999px; font-size: .85rem; background: rgba(124,58,237,.18); color: var(--text); border: 1px solid rgba(124,58,237,.35); margin-right: .5rem;}
.section-title {font-weight: 600; font-size: 1.2rem; margin: .25rem 0 .75rem 0;}
.stepper {display: flex; gap: .5rem; margin: .5rem 0 1rem;}
.step {flex: 1; padding: .5rem .8rem; border-radius: 12px; text-align: center; background: rgba(255,255,255,.06); color: var(--muted); border: 1px solid rgba(255,255,255,.08);}
.active {background: rgba(124,58,237,.16); color: var(--text); border-color: rgba(124,58,237,.45);}
.roadmap-item {padding: .5rem .75rem; border-radius: 10px; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03); margin-bottom: .5rem;}
body {background: var(--bg);}
</style>
"""
st.markdown(style, unsafe_allow_html=True)
st.markdown('<div class="app-container">', unsafe_allow_html=True)
st.markdown('<div class="hero"><h2 style="margin:0">🚀 Startup Architect</h2><p style="margin:.25rem 0 0;color:#cbd5e1">Plan, mentor, and prototype your idea.</p></div>', unsafe_allow_html=True)

if "step" not in st.session_state:
    st.session_state.step = 1
if "plan" not in st.session_state:
    st.session_state.plan = None
if "answers" not in st.session_state:
    st.session_state.answers = {}
if "category" not in st.session_state:
    st.session_state.category = None

progress_values = {1: 25, 2: 50, 3: 75, 4: 100}
st.progress(progress_values.get(st.session_state.step, 0))
st.markdown(
    f"""
    <div class="stepper">
      <div class="step {'active' if st.session_state.step==1 else ''}">1 • Ideate</div>
      <div class="step {'active' if st.session_state.step==2 else ''}">2 • Plan</div>
      <div class="step {'active' if st.session_state.step==3 else ''}">3 • Mentor</div>
      <div class="step {'active' if st.session_state.step==4 else ''}">4 • Prototype</div>
    </div>
    """,
    unsafe_allow_html=True,
)

if st.session_state.step == 1:
    with st.form("idea_form"):
        left, right = st.columns([2, 1])
        with left:
            idea = st.text_area("Idea", placeholder="Describe your idea clearly")
        with right:
            grade = st.slider("Grade", min_value=6, max_value=12, value=8, step=1)
            category = st.radio("Category", ["App", "AI Tool", "Marketplace"])
        submit = st.form_submit_button("Generate Plan")
    if submit:
        with st.spinner("🤖 AI is generating your startup plan..."):
            try:
                plan: StartupPlan = architect_agent(idea, grade, category)
                st.session_state.plan = plan
                st.session_state.category = category
                st.session_state.step = 2
                st.success("✅ Startup plan generated successfully!")
            except Exception as e:
                st.error(f"❌ Error generating plan: {str(e)}")
                st.stop()

elif st.session_state.step == 2 and st.session_state.plan:
    plan: StartupPlan = st.session_state.plan
    top_l, top_r = st.columns([2, 1])
    with top_l:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.subheader(plan.name)
        st.markdown(f'<span class="badge">Audience</span> {plan.audience}', unsafe_allow_html=True)
        st.markdown(f'<span class="badge">Revenue</span> {plan.revenue}', unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
    with top_r:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.success(plan.problem)
        st.markdown("</div>", unsafe_allow_html=True)
    mid_l, mid_r = st.columns([2, 1])
    with mid_l:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown('<div class="section-title">Features</div>', unsafe_allow_html=True)
        st.info("\n".join(plan.features))
        st.markdown("</div>", unsafe_allow_html=True)
    with mid_r:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown('<div class="section-title">Roadmap</div>', unsafe_allow_html=True)
        for item in plan.roadmap:
            st.markdown(f'<div class="roadmap-item">{item}</div>', unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
    if st.button("Proceed to Mentorship"):
        st.session_state.step = 3

elif st.session_state.step == 3 and st.session_state.plan:
    plan: StartupPlan = st.session_state.plan
    questions = get_mentor_questions(plan)
    answers_col = []
    st.markdown('<div class="card">', unsafe_allow_html=True)
    for i, q in enumerate(questions):
        ans = st.text_input(q, value=st.session_state.answers.get(q, ""), key=f"answer_{i}")
        answers_col.append((q, ans))
    st.markdown("</div>", unsafe_allow_html=True)
    if st.button("Proceed to Prototype"):
        st.session_state.answers = {q: a for q, a in answers_col}
        st.session_state.step = 4

elif st.session_state.step == 4 and st.session_state.plan:
    plan: StartupPlan = st.session_state.plan
    
    with st.spinner("🔨 Forging your prototype..."):
        try:
            html_content = forge_agent(plan)
            st.markdown('<div class="card">', unsafe_allow_html=True)
            st.subheader("🚀 Prototype")
            st.markdown(f'**{plan.name} Landing Page**')
            st.code(html_content, language="html")
            st.download_button(
                "📥 Download HTML", 
                data=html_content, 
                file_name="prototype.html", 
                mime="text/html"
            )
            if st.button("🔄 Start Over"):
                st.session_state.step = 1
                st.session_state.plan = None
                st.session_state.answers = {}
                st.session_state.category = None
            st.markdown("</div>", unsafe_allow_html=True)
        except Exception as e:
            st.error(f"❌ Error generating prototype: {str(e)}")
            st.stop()
st.markdown("</div>", unsafe_allow_html=True)
