# Video Processing Web Application  

This web application allows users to upload video files and perform various processing tasks, such as extracting audio and modifying video dimensions, using the FFMPEG library.  

---

## Features  
- **Upload Videos**: Supports video file uploads for processing.  
- **Extract Audio**: Extracts audio tracks from uploaded video files.  
- **Modify Video Dimensions**: Allows resizing and dimension changes for videos.  

---

## Requirements  
- **Node.js**: Ensure Node.js is installed on your system.  
- **FFMPEG**: Install FFMPEG on your system.  
  - On macOS:  
    ```bash
    brew install ffmpeg
    ```  
  - On Ubuntu:  
    ```bash
    sudo apt update && sudo apt install ffmpeg
    ```  
  - On Windows: Download the executable from [FFMPEG.org](https://ffmpeg.org/) and add it to your system's PATH.  

---

## Installation  

1. Clone the repository:  
    ```bash
    git clone <repository_url>
    ```  

2. Navigate to the project directory:  
    ```bash
    cd video-processing-web-app
    ```  

3. Install dependencies:  
    ```bash
    npm install cpeak
    ```  

---

## Usage  

1. Start the application:  
    ```bash
    node src/index.js
    ```  

2. Open your browser and navigate to:  
    ```
    http://localhost:8060
    ```  

3. Use the interface to upload videos and perform processing tasks.  

---

## File Structure  

- **src/index.js**: The main file to start the application.  
- **src/routes/**: Contains API route handlers.
- **public**: directory is the front end.
- **storage/**: Directory where uploaded files are stored along with processed files.

---

## Contributing  
Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss your ideas.  

---

## License  
This project is licensed under the [MIT License](LICENSE).  

---

## Acknowledgments  
- **FFMPEG**: For the powerful multimedia framework used in this application.  
