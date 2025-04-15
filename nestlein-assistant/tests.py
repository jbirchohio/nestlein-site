import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get your API key
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("❌ OPENAI_API_KEY is not set.")
    exit()

# Initialize client
client = OpenAI(api_key=api_key)

# Test prompt
try:
    print("📡 Sending test request to OpenAI...")

    response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Just checking if this works. Say hello!"}
    ],
)

    print("✅ Response received:")
    print(response.choices[0].message.content)

except Exception as e:
    print("❌ Error occurred:")
    print(e)
