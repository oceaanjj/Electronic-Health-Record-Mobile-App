# 🏥 EHR Mobile App - Electronic Health Record System

> **Your health companion in your pocket** 📱✨

Welcome to the **Electronic Health Record (EHR) Mobile App** – a comprehensive healthcare management system built with love to help nurses, doctors, and healthcare professionals deliver better patient care.

---

## 🎯 What's This All About?

The EHR Mobile App is a full-stack healthcare solution that helps healthcare professionals:

- 📋 **Manage Patient Records** - Keep comprehensive, organized patient information
- 🩺 **Track Clinical Assessments** - Physical exams, vital signs, lab values, and more
- 🧠 **Smart Clinical Decisions** - Get AI-powered alerts and recommendations
- 📊 **ADPIE Workflow** - Follow the nursing process (Assessment → Diagnosis → Planning → Intervention → Evaluation)
- 💊 **Medication Management** - Track medications, administrations, and reconciliation
- ✅ **Data at Your Fingertips** - Access patient info anytime, anywhere

---

## 🚀 Quick Start

### Prerequisites

Before you dive in, make sure you have:

- **Node.js** & **npm** (for the mobile app)
- **Python 3.8+** (for the backend)
- **MySQL** (for the database)
- **Git** (for version control)

### 🏃 Getting Started

#### 1️⃣ **Clone the Repository**
```bash
git clone <repository-url>
cd ehr-app-1
```

#### 2️⃣ **Setup the Mobile App**
```bash
# Navigate to the app folder
cd ehr

# Install dependencies
npm install

# Start the development server
npm start
```

#### 3️⃣ **Setup the Backend** (FastAPI)
```bash
# Navigate to the backend folder
cd ehr_backend

# Create a virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

#### 4️⃣ **Access the App**

- **Mobile App**: `http://localhost:3000`
- **API Documentation**: `http://localhost:8000/docs`
- **API ReDoc**: `http://localhost:8000/redoc`

---

## 📁 Project Structure

```
ehr-app-1/
├── ehr/                          # 📱 Mobile App (React Native + TypeScript)
│   ├── src/
│   ├── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── ehr_backend/                  # 🔧 Backend API (FastAPI + Python)
│   ├── app/
│   │   ├── core/                 # CDSS Engine & Security
│   │   ├── database/             # Database Connection & Schema
│   │   ├── models/               # SQLAlchemy ORM Models
│   │   │   ├── patient.py
│   │   │   ├── physical_exam/
│   │   │   ├── vital_signs/
│   │   │   ├── medication_administration/
│   │   │   ├── medication_reconciliation/
│   │   │   └── ...
│   │   ├── routers/              # API Endpoints
│   │   │   ├── auth.py
│   │   │   ├── patient.py
│   │   │   ├── physical_exam/
│   │   │   ├── vital_signs/
│   │   │   └── ...
│   │   ├── cdss_rules/           # Clinical Decision Rules (YAML)
│   │   └── main.py
│   ├── requirements.txt
│   └── ...
│
├── README.md                      # 👈 You are here!
└── EHR_BACKEND_DOCUMENTATION.md  # 📚 Detailed API docs
```

---

## 💡 Key Features

### 🎨 **Modern UI/UX**
- Clean, intuitive interface for healthcare professionals
- Easy-to-use forms for data entry
- Real-time validation and error handling

### 🧠 **Smart CDSS Engine**
- Rule-based clinical decision support system
- Auto-generated alerts for abnormal findings
- Evidence-based recommendations

### 📊 **ADPIE Workflow**
Complete support for the nursing process:
1. **Assessment** - Gather clinical data (vital signs, physical exam, etc.)
2. **Diagnosis** - Identify nursing diagnoses based on findings
3. **Planning** - Create care plans
4. **Intervention** - Document interventions provided
5. **Evaluation** - Assess outcomes and progress

### 💊 **Comprehensive Components**
- ✅ **Physical Exam** - Systematic physical assessment
- ✅ **Vital Signs** - Temperature, HR, RR, BP, SpO2 monitoring
- ✅ **Intake & Output** - Fluid balance tracking
- ✅ **Activities of Daily Living (ADL)** - Functional assessment
- ✅ **Lab Values** - 14+ laboratory test results
- ✅ **Medical History** - 5 sub-components (illnesses, allergies, vaccinations, etc.)
- ✅ **Diagnostics** - Medical imaging upload and storage
- ✅ **IVs & Lines** - IV fluid administration tracking
- ✅ **Discharge Planning** - Readiness and instructions
- ✅ **Medication Administration** - MAR (Medication Administration Record)
- ✅ **Medication Reconciliation** - Home → Current → Changes tracking

### 🔐 **Security & Privacy**
- JWT-based authentication
- Role-based access control (RBAC)
- Encrypted data storage
- HIPAA-compliant design

---

## 📚 API Endpoints Overview

### Patient Management
```
POST   /patients/                    # Create patient
GET    /patients/                    # List patients
GET    /patients/{patient_id}        # Get patient details
PUT    /patients/{patient_id}        # Update patient
DELETE /patients/{patient_id}        # Delete patient
```

### Physical Exam
```
POST   /physical-exam/               # Create exam
GET    /physical-exam/patient/{id}   # List exams for patient
GET    /physical-exam/{exam_id}      # Get exam details
PUT    /physical-exam/{exam_id}/assessment
PUT    /physical-exam/{exam_id}/diagnosis
PUT    /physical-exam/{exam_id}/planning
PUT    /physical-exam/{exam_id}/intervention
PUT    /physical-exam/{exam_id}/evaluation
DELETE /physical-exam/{exam_id}      # Delete exam
```

### Vital Signs
```
POST   /vital-signs/                 # Create vital signs
GET    /vital-signs/patient/{id}     # List vitals for patient
GET    /vital-signs/{record_id}      # Get vital signs
PUT    /vital-signs/{record_id}/assessment
[... similar DPIE endpoints ...]
DELETE /vital-signs/{record_id}      # Delete vitals
```

### Medication Management
```
# Medication Administration (MAR)
POST   /medication-administration/
GET    /medication-administration/patient/{patient_id}
PUT    /medication-administration/{admin_id}
DELETE /medication-administration/{admin_id}

# Medication Reconciliation
POST   /medication-reconciliation/home-medication/
POST   /medication-reconciliation/current-medication/
POST   /medication-reconciliation/changes-in-medication/
[... full CRUD endpoints for all 3 tables ...]
```

👉 **Full API documentation available at**: `http://localhost:8000/docs`

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with TypeScript
- **Testing**: Jest
- **Build Tools**: Metro, Babel
- **Styling**: Custom styles + React Native components

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database**: MySQL
- **Authentication**: JWT
- **API Docs**: Swagger UI + ReDoc

### Database
- **Engine**: MySQL 10.4.32 (MariaDB)
- **Design**: Relational database with cascade delete
- **Encoding**: UTF-8 MB4 (full Unicode support)

---

## 🎓 Learn More

For detailed information about the backend API, components, and integration:

📖 **[Backend Documentation](./EHR_BACKEND_DOCUMENTATION.md)**

This comprehensive guide includes:
- Detailed component specifications
- CDSS Engine documentation
- All API endpoint documentation
- Database schema diagrams
- Setup and integration instructions
- Troubleshooting guide
- Best practices and conventions

---

## 🧪 Testing

### Run Tests
```bash
# Mobile App Tests
cd ehr
npm test

# Backend Tests
cd ehr_backend
pytest
```

### API Testing
Use the interactive Swagger UI at `http://localhost:8000/docs` to test all endpoints!

---

## 🚧 Development Workflow

### Creating a New Component

1. **Create the Model** (`app/models/component_name/`)
2. **Create the Router** (`app/routers/component_name/`)
3. **Add CDSS Rules** (`app/cdss_rules/component_name/assessment.yaml`)
4. **Update `main.py`** with imports and router registration
5. **Update Patient Model** with relationships
6. **Add Documentation** to this README

### Database Migrations

For new fields or tables:
1. Update SQLAlchemy models
2. Update Pydantic schemas
3. SQLAlchemy will handle migrations on app startup (development)
4. For production, create manual migration scripts

---

## 🐛 Troubleshooting

### "Can't connect to MySQL"
```bash
# Check MySQL is running
# Update credentials in: ehr_backend/app/database/db.py
```

### "Module not found" errors
```bash
# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### "Foreign key constraint errors"
All ID columns must be `BIGINT(unsigned=True)` - check your database schema!

👉 **More troubleshooting in [Backend Documentation](./EHR_BACKEND_DOCUMENTATION.md#troubleshooting)**

---

## 📊 Project Statistics

- **Components Implemented**: 12+ clinical components
- **API Endpoints**: 70+ endpoints
- **Database Tables**: 20+ tables
- **CDSS Rules**: Comprehensive ruleset across all components
- **Test Coverage**: Expanding 📈

---

## 🎯 Roadmap

### Current Phase ✅
- [x] Core components (Physical Exam, Vital Signs, etc.)
- [x] CDSS Engine
- [x] Patient management
- [x] Medication tracking
- [x] Mobile app framework

### Next Phase 🔄
- [ ] Advanced CDSS features (ML-based alerts)
- [ ] Nursing diagnosis automation
- [ ] Analytics dashboard
- [ ] Data export (PDF, reports)
- [ ] Mobile app UI enhancements

### Future Phase 📋
- [ ] Telemedicine integration
- [ ] Wearable device integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Offline-first capability

---

## 🤝 Contributing

We ❤️ contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Follow PEP 8 for Python
- Use TypeScript for frontend code
- Include docstrings and comments
- Write descriptive commit messages

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support & Contact

- 📧 **Email**: support@ehr-app.com
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/bryngrl/ehr-app-1/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/bryngrl/ehr-app-1/discussions)
- 📚 **Documentation**: See [Backend Documentation](./EHR_BACKEND_DOCUMENTATION.md)

---

## 🙏 Acknowledgments

Built with ❤️ by the healthcare tech team, inspired by:
- Modern nursing practices
- Evidence-based clinical guidelines
- User-centered design principles
- Open-source community

---

## 📈 Status

| Component | Status | Progress |
|-----------|--------|----------|
| **Backend API** | ✅ Active | 100% |
| **Mobile App** | 🔄 In Development | 85% |
| **CDSS Engine** | ✅ Active | 100% |
| **Documentation** | ✅ Complete | 95% |
| **Testing** | 🔄 In Progress | 70% |
| **Deployment** | 📋 Planned | 0% |

---

## 🎉 Quick Tips

✨ **Pro Tips for Using the App**:

1. **Always check the alerts** - The CDSS engine provides valuable clinical insights
2. **Complete the ADPIE workflow** - Assessment → Diagnosis → Planning → Intervention → Evaluation
3. **Use the Swagger UI** - Great for API testing during development (`http://localhost:8000/docs`)
4. **Check medication reconciliation** - Ensure accurate medication lists before discharge
5. **Keep records current** - Real-time data = better decisions

---

## 🌟 Fun Facts

- 🏥 Supports 12+ clinical assessment components
- 📊 Tracks 70+ health parameters across different assessments
- 🧠 CDSS Engine can generate alerts in milliseconds
- 💾 Built on MySQL, Python, React, and TypeScript
- 🚀 Deployed with FastAPI for lightning-fast responses

---

## 🎊 You're All Set!

You're ready to start using the EHR Mobile App! Here's your next steps:

1. ✅ Follow the [Quick Start](#-quick-start) section
2. 📖 Read the [Backend Documentation](./EHR_BACKEND_DOCUMENTATION.md)
3. 🧪 Test the API using Swagger UI
4. 📱 Explore the mobile app
5. 🚀 Deploy to your server

---

**Happy coding! 🎈 If you have questions, check the documentation or open an issue.** 

**Made with 💙 for better healthcare** 🏥✨

---

*Last Updated: February 21, 2026*  
*Version: 1.0.0*  
*Repository: https://github.com/bryngrl/ehr-app-1*
