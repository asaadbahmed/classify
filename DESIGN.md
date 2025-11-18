Goal: Classify each email into one of the preset categories, along with a confidence score.

Step 1.
OAuth – connect Outlook account, receive Mail.ReadBasic permission.
Note: Use delta queries in the future to fetch only new messages that haven’t been classified yet.

Step 2.
Call GET /me/messages. You now have a JSON collection of all the emails (each represented as a message object with fields like id, subject, from, receivedDateTime, and snippet of body).

Step 3.
Preprocess the emails for classification. Extract relevant fields for analysis: subject, bodyPreview/body, from/emailAddress.

Step 4.
Run the classification algorithm/AI prompt:
- Assign each email to a category.
- Generate a confidence score for each classification.
- Example: Invoice → 0.92, Supplier → 0.75.

Step 5.
Store the classification results in your local database:
- Map each email id to its assigned category and confidence score.
- This allows us to skip already processed emails on subsequent logins.

Step 6.
Send the curated dataset to the frontend dashboard:
- Display emails grouped by category.
- Show subject, sender, received date, confidence score.
- Include an “Open in Outlook” button linking to the full email.

Step 7.
(Optional) Future enhancements:
- Use delta queries to fetch only new or updated emails.
- Extend to Mail.Read to fetch full bodies or attachments if needed.
- Add analytics, charts, or automated prioritization.