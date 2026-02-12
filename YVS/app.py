import os
from dotenv import load_dotenv
load_dotenv()
import google.genai as genai # type: ignore
import streamlit as st # type: ignore
from youtube_transcript_api import YouTubeTranscriptApi # type: ignore

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

link="https://www.youtube.com/watch?v=HFfXvfFe9F8"
def generate_transcript(youtube_url):
    try:
        video_id=youtube_url.split("=")[1]
        ytt_api = YouTubeTranscriptApi()
        transcript_data=ytt_api.fetch(video_id)        
        
        transcript=""

        for line in transcript_data:
            transcript+=" "+line.text
        return transcript
    except Exception as e:
        raise e




prompt="""You are an expert content analyst.
I will provide a YouTube video link or transcript.
Create a clear, human-sounding summary that captures the main ideas without filler.

Requirements:

Start with a 2 or 3 line overview explaining what the video is about and why it matters

Organize the content into logical sections with short headings

Explain ideas in simple, natural language

Remove repetition, sponsors, and fluff

Highlight key insights or takeaways

End with a Quick Recap (5 or 7 bullet points).

Tone:

Conversational and human

No emojis

No AI mentions

Output format:
Title → Overview → Sectioned Summary → Key Insights → Quick Recap"""

def response_generation(transcribe_text):
    response = client.models.generate_content(model="gemini-2.5-flash",contents=prompt+transcribe_text)   
    return response.text
import re
from urllib.parse import urlparse, parse_qs

def get_video_id(youtube_url: str):
    if not youtube_url:
        return None

    parsed = urlparse(youtube_url)

    # youtube.com URLs
    if parsed.hostname in ("www.youtube.com", "youtube.com", "m.youtube.com"):
        # watch?v=VIDEO_ID
        if parsed.path == "/watch":
            return parse_qs(parsed.query).get("v", [None])[0]

        # /shorts/VIDEO_ID or /embed/VIDEO_ID
        match = re.match(r"/(shorts|embed)/([^/?]+)", parsed.path)
        if match:
            return match.group(2)

    # youtu.be/VIDEO_ID
    if parsed.hostname == "youtu.be":
        return parsed.path.lstrip("/")

    return None



st.title="YouTube Video Summerizer"
youtube_url=st.text_input("Which video you want to summerize")
if youtube_url:
    video_id=get_video_id(youtube_url)
    st.image(f"http://img.youtube.com/vi/{video_id}/0.jpg",use_column_width=True)

if st.button("get your script"):
    transcript_text=generate_transcript(youtube_url)
    if transcript_text:
        summary=response_generation(transcript_text)
        st.markdown("## Detailed Notes:")
        st.write(summary)