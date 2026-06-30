# 🔥 YOLO-MP: Lightweight Forest Fire Detection System

![Python](https://img.shields.io/badge/Python-3.10-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-DeepLearning-red)
![YOLO](https://img.shields.io/badge/YOLO-v8-green)
![OpenCV](https://img.shields.io/badge/OpenCV-ComputerVision-orange)


A lightweight **Forest Fire Detection System** built using a customized **YOLO-MP (YOLO Multi-Path)** architecture for accurate real-time fire detection. The model detects forest fires from **images, videos, and live webcam streams**, making it suitable for intelligent wildfire monitoring and early warning systems.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Dataset](#-dataset)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Model Architecture](#-model-architecture)
- [Results](#-results)
- [Applications](#-applications)
- [Future Improvements](#-future-improvements)


---

# 📖 Overview

Forest fires pose a significant threat to ecosystems, wildlife, and human life. Early detection is essential to minimize damage.

This project implements a lightweight deep learning model inspired by the **YOLO-MP** architecture for fast and accurate forest fire detection. The model is optimized for real-time inference while maintaining high detection accuracy, making it suitable for deployment on resource-constrained devices.

The project supports detection from:

- 🖼️ Images
- 🎥 Videos
- 📹 Live Webcam

---

# 🚀 Features

- Real-time forest fire detection
- Lightweight YOLO-MP architecture
- Supports image, video, and webcam inference
- High-speed object detection
- Custom trained model
- Easy deployment
- GPU acceleration support
- Edge-device friendly

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Programming Language | Python |
| Deep Learning | PyTorch |
| Object Detection | Ultralytics YOLO |
| Computer Vision | OpenCV |
| Data Processing | NumPy |
| Training Platform | Kaggle |
| Annotation Tool | RoboFlow |

---

# 📊 Dataset

The dataset consists of annotated forest fire images collected from publicly available sources.

**Dataset Link**

https://www.kaggle.com/datasets/elmadafri/the-wildfire-dataset

https://ieee-dataport.org//documents/aerial-fire-and-smoke-essential-dataset

### Classes

```
fire
```

> **Note:** The dataset is not included in this repository due to GitHub storage limitations.

---

# 📁 Project Structure

```
forest-fire-project/
│
├── GUI/
│
├── Source code/
│
├── Models/
│
├── Images/
│
├── Videos/
│
├── README.md
│
└── requirements.txt
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/jayeesh729/forest-fire-project.git
```

```bash
cd forest-fire-project
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

If you don't have a requirements file:

```bash
pip install ultralytics opencv-python torch torchvision numpy
```

---

# 🧠 Model Architecture

The proposed model is based on the YOLO architecture with lightweight optimizations inspired by **YOLO-MP**.

Major improvements include:

- Lightweight feature extraction
- Efficient multi-scale learning
- Improved bounding box localization
- Faster inference with reduced computational complexity

---

# 📈 Results

The model was trained using a custom forest fire dataset and achieved reliable performance for real-time detection.

| Metric | Value |
|---------|-------|
| Precision | 85.5% |
| Recall | 80.1% |
| mAP@50 | 87.8% |
| Real-time Inference | ✅ |


---

# 🌍 Applications

- Forest surveillance
- Wildfire monitoring
- Disaster management
- Smart forestry
- Environmental monitoring
- UAV/Drone fire detection
- Edge AI deployment

---

# 🔮 Future Improvements

- Smoke detection
- Multi-class fire classification
- Drone integration
- Mobile deployment
- Edge device optimization
- Thermal camera support
- IoT integration for smart forests

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create your feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push the branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---



# 👨‍💻 Author

**Jayeesh Vasantha Kumar**

GitHub

https://github.com/jayeesh729

LinkedIn

www.linkedin.com/in/jayeessh-vasantha-kumar-49709a301

---

## ⭐ If you found this project useful, please consider giving it a Star!

It helps others discover the project and supports future development.
