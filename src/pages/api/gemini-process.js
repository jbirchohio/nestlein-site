export async function POST({ request }) {
  const { raw_json } = await request.json();

  const GCP_API_KEY = import.meta.env.GEMINI_API_KEY;

  const prompt = `
Using this data I want you to output some information for me:
${raw_json}

##Guidelines##
0. Your output must follow my rules.
1. Print your Information in American English.
2. Do NOT show the Scoring Algorithm Guidelines in your response — only show the final score.
3. I will give you a title of a field I want you to output data for. The field will be wrapped in asterisks — for example: **Restaurant Title**: followed by the rules I have given you.
4. If a piece of data is not clearly available, use your best judgment or return "Unknown".

### Scoring Algorithm:
Please analyze the data for this place and assign scores for these categories:
 1. Food/Quality (taste, freshness, presentation)  
 2. Service (friendliness, speed, attentiveness)  
 3. Ambiance/Atmosphere (cleanliness, décor, vibe, noise level)  
 4. Value (worth the cost, portion size, overall pricing)  
 5. Experience (overall enjoyment, any standout moments or issues)

Each category should be scored individually from 1 to 10. Then, calculate the **Final Score** as the average of these five categories, rounded to one decimal place.

**Final Score**: X.X/10  
**Do Not Give any Disclaimers** about the scores or how they were calculated.

---

##Basic Information##

**Restaurant Name**: Print the name of the restaurant.

**Website URL**: Print the base URL of the business and append ?ref=nestlein to the end.

Logo URL: Print the full image URL for the restaurant logo if it exists in the raw data. If not available, return an empty string ("").

**Address**: Print the full business address, including street number, street name, city, state, and ZIP code.

**Phone Number**: Print the phone number in standard U.S. format.

**Hours of Operation**: Print the business hours in 12-hour format. If they show split or inconsistent hours, return: "Check Website for Updated Hours".

**Restaurant Score**: Print only the final score out of 10, to two decimal places.

**Best Time to Work Remotely**: State the best time to work there (e.g., "Weekday mornings before 11am" or "Tuesdays from 12–8pm").

---

##Remote Work Features##

**Wi-Fi Quality**: Rate or describe Wi-Fi speed and reliability (e.g., Fast, Spotty, Slow, Secure).

**Outlet Access**: How many outlets are available? (e.g., Lots, Few, None, Some under seats).

**Noise Level**: Describe typical noise level (e.g., Quiet, Moderate, Loud).

**Seating Comfort**: Describe the comfort level of seating for working (e.g., Cozy couches, Padded booths, Uncomfortable chairs, Spacious tables).

**Natural Light**: Is there a good amount of natural light? (Yes/No/Some).

**Stay Duration Friendliness**: Can customers stay for long periods? (Yes, Encouraged / No, 1-hour max / Not specified).

**Food & Drink Options**: Summarize available food/drinks (e.g., Coffee, teas, vegan pastries, smoothies).

**Bathroom Access**: State if bathrooms are available and easy to access (Yes / No / Customers Only / Unknown).

**Parking Availability**: Describe available parking (e.g., Street parking, Lot available, Limited spots, No parking).

**Tags**: Based on all the data, suggest 3–5 relevant tags such as: Quiet Space, Pet-Friendly, LGBTQ+ Friendly, Fast Wi-Fi, Study Spot, Vegan Options, Black-Owned, Good for Groups.

`;

  const geminiReq = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GCP_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const geminiRes = await geminiReq.json();
  const text = geminiRes.candidates?.[0]?.content?.parts?.[0]?.text || 'Error: No response';

  return new Response(JSON.stringify({ content: text }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
