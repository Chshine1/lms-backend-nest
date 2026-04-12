# Student Interface Design

## 6. My Courses

### 6.3.3 Assignments (Global View)

**Components:**

- **Assignment List**

  Each assignment includes:
    - Assignment title
    - Associated lecture
    - Due date
    - Status:
        - Not submitted
        - Submitted
        - Overdue
    - Grade (if available)

**Functionality:**

- Sorted by:
    - Overdue
    - Upcoming
    - Completed
- Clicking an assignment opens detail page:
    - Submission
    - Feedback
    - Score

---

### 6.3.4 Exams (Course-Specific View)

Each course has its own exam plan, and exam availability is determined by course progress milestones or advisor-defined settings.

**Components:**

- **Exam Plan / Availability**
    - Mock exams are unlocked based on course progress milestones
    - Advisors can configure:
        - exam timing
        - exam type
        - required or optional participation
    - Each exam includes:
        - availability status
        - scheduled time (if booked)

- **Exam List**

  Each exam includes:
    - Exam title
    - Lecture reference
    - Exam type (e.g., Quiz, Mock Test)
    - Status:
        - Not available
        - Available
        - Booked
        - Completed
        - Missed
    - Scheduled time (if applicable)
    - Score (if available)

**Functionality:**

- Students can view all exams associated with the selected course
- Students can book mock exams when they become available
- Exam availability is triggered by:
    - course progress
    - advisor configuration
- Students can access exams directly from this page
- The system tracks:
    - participation
    - missed exams
    - results

---

### 6.4 Assignment Detail View

#### Assignment Information Section

Displays key assignment details:
- Assignment title
- Assignment type (e.g., Homework, Writing, Practice)
- Associated course and lecture
- Due date
- Current status:
    - Not submitted
    - Submitted
    - Overdue
    - Graded

#### Description Section

- Full assignment instructions

#### Attached Files Section

- List of files provided by the instructor

#### Submission Section

**Input Options:**
- Rich text editor
- File upload

**Components:**
- Text editor
- Upload button
- Submit button

**Functionality:**
- Students can submit:
    - text only
    - file only
    - or both
- Submission replaces previous submission if resubmission is allowed
- Submission status updates immediately after submission

#### Submission History

Displays past submissions (if applicable):
- Submission timestamp
- Submitted content or file
- Version history (if resubmitted)

#### Feedback Section

Displayed after grading.

Includes:
- Score (e.g., 95/100)
- Teacher comments
- Additional feedback files (optional)

---

### 6.5 Exam Detail View

#### Exam Information Section

Displays key exam details:
- Exam title
- Associated course and lecture
- Exam type (e.g., Quiz, Mock Test)
- Duration (if applicable)
- Status:
    - Not started
    - In progress
    - Completed
- Instructions

#### Exam Content Section

**Question Types Supported:**

- **Multiple Choice**
    - Single correct answer
    - Multiple correct answers

- **Short Answer**
    - Text input field

- **Long Answer**
    - Rich text editor
    - Optional word count limit

- **Media-Based Questions**
    - Questions may include:
        - Images
        - PDFs
        - Text passages

**Components per Question:**
- Question number
- Question content
- Input area
- Optional attachments

**Functionality**
- Students can navigate between questions
- Answers are saved automatically (if enabled)
- Students can review and modify answers before submission

#### Submission Section

**Components:**
- Submit button
- Confirmation prompt

**Functionality:**
- Students submit the exam when complete
- System records submission time
- Submission finalizes answers

#### Result & Feedback Section

Displayed after submission.

**Components:**
- Score (if available)
- Status:
    - Graded
    - Pending grading
- Feedback:
    - Automatic feedback (objective questions)
    - Teacher feedback (subjective questions)

**Functionality:**
- Objective questions are auto-graded
- Subjective questions are graded manually
- Students can review:
    - correct answers (if allowed)
    - teacher comments

---

## 7. Reports

### 7.2 Report Types

#### 7.2.1 Stage Report

Generated periodically based on learning progress.

Includes:
- Lectures completed
- Task completion rate
- Assignment performance
- Behavioral indicators (e.g., engagement level)
- Mock exam results (if applicable)

#### 7.2.2 Mock Exam Report

Generated after each mock exam.

Includes:
- Overall score
- Section scores:
    - Listening
    - Reading
    - Writing
    - Speaking
- Performance breakdown
- Weakness analysis
- Suggested improvements

#### 7.2.3 Final Report

Generated at the end of the course.

Includes:
- Overall course performance
- Learning progress summary
- Final evaluation

**Additional Analysis:**
- Comparison between:
    - target score
    - actual score

**Outcome:**
- If target achieved:
    - completion summary
- If target not achieved:
    - improvement recommendations:
        - required course hours
        - focus areas
        - skill improvement suggestions

---

### 7.3 Report Detail View

**Components:**
- Report title
- Course reference
- Date

**Performance Summary**
- Overall score
- Key metrics
- Progress indicators

**Performance Analysis**
- Section-level breakdown
- Accuracy by task type
- Weak areas

**Behavioral Insights**
- Time spent on learning
- Task completion trends
- Engagement level

**Feedback Section**

Includes:
- Teacher comments (optional)
- Personalized feedback
- Recommendations for improvement

---

# Teacher Interface

## 2.3.4 Assignment Grading

**Steps:**
1. Teacher reviews submitted assignments
2. Teacher provides score and feedback

**System Behavior:**
- Displays:
    - student submission
    - submission history
- Allows:
    - scoring
    - written feedback
    - file-based feedback
- Updates:
    - assignment status
    - student performance data

---

## 2.3.5 Exam Evaluation

**Steps:**
1. Teacher reviews exam results
2. Teacher evaluates subjective responses

**System Behavior:**
- Automatically grades objective questions
- Provides interface for:
    - manual grading
    - feedback
- Updates exam results and student performance

---

## 5. My Classes

### Assignments Tab

**Components:**

- **Assignment List**

  Each assignment includes:
    - Assignment title
    - Associated lecture
    - Due date
    - Status
    - Submission count

**Functionality:**

Teachers can:
- Create assignments
- Upload assignment files
- Edit instructions and due dates
- View student submissions
- Grade assignments
- Provide feedback
- Upload feedback files

---

### Exams Tab

**Components:**

- **Exam List**

  Each exam includes:
    - Exam title
    - Lecture reference
    - Exam type
    - Status
    - Student participation

**Functionality:**

Teachers can:
- Create exams
- Define question types:
    - Multiple choice
    - Short answer
    - Long answer
    - Media-based questions
- Review student submissions
- Grade subjective responses
- Provide feedback

---

# Parent Interface

## 8. Feedback

### 8.1 Page Layout

**Components:**

- **Feedback List**

  Each entry includes:
    - Course name
    - Lecture reference (e.g., Lecture 3)
    - Feedback type:
        - Lecture feedback
        - Assignment feedback
    - Date
    - Short summary

---

### 8.2 Feedback Detail View

**Components:**
- Course reference
- Lecture reference
- Date
- Feedback type

**Feedback Content**

Includes:
- Teacher comments
- Performance observations
- Areas for improvement
- Additional notes (if any)

**Functionality:**
- Feedback is displayed in read-only format
- Parents can review feedback at any time
- Feedback is linked to the corresponding lecture or assignment

---

### 8.3 Behavior

- Feedback is continuously generated as the student progresses
- Feedback is immediately visible once provided by the teacher
- Feedback is not restricted by time periods (unlike reports)
- Feedback history is retained and accessible