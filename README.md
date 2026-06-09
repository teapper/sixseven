# The Six-Seven Counter
Hello! Welcome to the Six-Seven Counter. In this game, you will be able to display the over-consumption of social media by mimicking the most popular meme in the world as of 2026. The game will instantly start the moment the website is loaded in, so be prepared! Raise those arms high and get those Six-Seven combos even higher. Enjoy!

# Credits
The project was created with the help of Artificial Intelligence offered by Google Gemini.
 
Link to Conversation: https://gemini.google.com/share/14a11f514685 

 # Design Decisions and Documentation
 1. Website is split into 3 separate files (index.html, script.js, style.css)
 2. The UI takes inspiration from Westminster High School's school website (whslions.net)
 3. The program has a zip file upload (my-pose-model.zip) for users to upload a trained model for the game to function properly
 4. Users have the ability to control the flow of the game (start, pause, restart scores)
 5. Pose model was trained using Google's Teachable Machine
 6. A video is included for users to view a sample on the game's function

# Limitations and Future Development
1. The user must upload the included zip file (my-pose-model.zip) containing: model.json, metadata.json, and weights.bin.
2. The camera must be focused on the user's chest, as the provided pose model does not accurately track arm movement.
3. Game functions best as the model trains on more diverse data
4. 

