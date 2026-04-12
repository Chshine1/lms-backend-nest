# Student Interface Design

## 2. Student Workflow

### 2.3.1 Account Access & Onboarding

**Steps:**
- Student registers or logs into the system
- Student completes profile setup if first-time user
- System initializes dashboard

### 2.3.2 Course Enrollment

**Steps:**
- Student is enrolled into course(s)
- Courses appear under "My Courses"
- Student accesses course content

**System Behavior:**
- Associate student with course data
- Load course-specific materials and tasks

### 2.3.4 Class Participation

**Steps:**
- Student attends scheduled class

**System Behavior:**
- Display class schedule
- Update progress

---

## 6. My Courses

### 6.3.6 Q&A (Course View)

**Components:**
- Question input field
- Question list

Each question includes:
- Question content
- Associated lecture (optional)
- Timestamp
- Answer status:
    - AI answered
    - Teacher answered

**Functionality:**
- Students can submit questions within the course
- System provides immediate AI response
- Teachers can review and provide additional answers
- Questions are visible to:
    - student
    - teacher
    - learning advisor

**Behavior:**
- Q&A is scoped to the current course
- Questions may optionally be linked to a lecture
- AI response is generated first
- Teacher response can supplement or override AI

---

## 9. Student Profile

### 9.4 Learning Progress

**Components:**
- Course progress indicators
- Lecture completion status
- Task completion rate

**Functionality:**
- Displays progress across all courses
- Updates dynamically based on:
    - completed lectures
    - completed tasks
    - participation

### 9.6 Activity History

**Components:**
- Task completion records
- Assignment submissions
- Exam attempts
- Attendance (if applicable)

**Functionality:**
- Displays chronological activity timeline
- Allows students to review past actions

---

# Teacher Interface

## 2. Teacher Workflow

### 2.3.1 Class Preparation

**Steps:**
- Teacher logs into the system
- Teacher views upcoming classes
- Teacher selects a class

**System Behavior:**
- Displays:
    - course information
    - lecture content
    - student list
- Provides visibility into:
    - student progress
    - weak areas
    - incomplete tasks

### 2.3.3 Attendance Recording

**Steps:**
- Teacher marks student attendance

**System Behavior:**
- Records attendance status
- Updates student progress
- Triggers:
    - recording unlock (if student absent)

---

## 5. My Classes

### 5.4 Attendance Recording

**Components:**
- Student List with attendance controls

Each student includes:
- Name
- Attendance status

**Functionality:**
Teachers can:
- Mark students as present or absent
- Record attendance in real time

**Behavior:**
- Attendance updates student progress
- If a student is marked absent:
    - corresponding recorded lesson is unlocked

---

# Parent Interface

## 2. Parent Workflow

### 2.3.1 Account Access & Monitoring Setup

**Steps:**
- Parent logs into the system
- Parent enters the dashboard
- Parent views the linked student's summary information

**System Behavior:**
- Displays the student's current status immediately after login

### 2.3.3 Attendance Review

**Steps:**
- Parent checks whether the student has attended recent classes
- Parent reviews any missed or marked-absent sessions

**System Behavior:**
- Displays attendance history
- Clearly marks:
    - present
    - absent
    - approved absence
    - unapproved absence
- Shows whether an absence has been charged or exempted

### 2.3.4 Absence Request Submission

**Steps:**
- Parent selects a class session
- Parent submits an absence request with reason
- Parent optionally provides supporting information if needed

**System Behavior:**
- Creates an absence request record
- Sends the request to the advisor for review
- Updates request status:
    - pending
    - approved
    - rejected

**Business Rule:**
- If the absence is approved by the advisor, the session is not charged
- If the absence is rejected, the session is charged normally

---

## 6. Attendance & Hours

### 6.2 Attendance History

**Components:**
- Attendance List

Each entry includes:
- Class date
- Lecture reference
- Attendance status:
    - present
    - absent
    - approved absence
    - unapproved absence

### 6.3 Course Hours Summary

**Components:**
- Total purchased hours
- Hours used
- Remaining hours

**Functionality:**
- Updates dynamically based on attendance records
- Reflects whether a session is charged or not

### 6.5 Behavior

- If a student is marked absent:
    - an absence record is created
- If an absence request is submitted:
    - status becomes pending
- If the request is approved:
    - the session is not charged
- If the request is rejected:
    - the session is charged normally
- All updates are reflected in:
    - attendance history
    - remaining course hours