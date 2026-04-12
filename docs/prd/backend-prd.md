Overall Architecture：
Overview:
This page should be the first page users should see when trying to use the product. Users cannot use the product without
an appropriate account and registration.

This page should contain the following functions:

- Sign up and log in with a Coursistant account
- Sign up and log in with phone number
- Sign up and log in with a third-party account (QQ/Wechat/SMS)
- When signing up for a coursistant account, there should be a verification email.

Sign-up information:
Sign-up pages are only allowed for student and parent accounts. Teacher or other staff accounts need to be created by
admin.

1. Nickname

- Editable after registration

2. Email Address

- Used for account identification and login
- Must be unique
- Cannot be modified after registration

3. Phone Number

- Used for login and communication
- Supports international formats
- Can be updated in account settings

4. Password

- Used for secure login
- Can be changed after verification

5. Invitation Code (Optional)

- Used for internal testing or organization-based onboarding

User Roles & Permissions
1.1 Overview
The system supports multiple user roles with distinct responsibilities and access permissions.
User roles are divided into:

- End Users (students and parents)
- Operational Users (teachers and learning advisors)
- System Administrator
  1.2 User Roles Definition
  1.2.1 Student（学生）
  Access Scope:
- Own profile and learning data only
- Own reports, tasks, and progress
  1.2.2 Parent（家长）
  Access Scope:
- Linked student(s) data only
- Read-only access (no modification rights)
  1.2.3 Teacher（教师）
  Access Scope:
- Students within assigned classes only
- Teaching-related data only
  1.2.4 Learning Advisor（学导）
  Access Scope:
- Assigned students only
- Full access to student learning data
- Ability to edit planning and feedback
  1.2.5 System Administrator（管理员）
  Access Scope:
- Full system access
- Cross-role visibility
- Configuration and audit control
  1.3 Role Assignment Rules
- Students and Parents can self-register through the system
- Teachers, Learning Advisors, and Admins must be created by the system administrator
- Each user must have at least one role assigned
- A user may have multiple roles if required (e.g., Admin + Teacher)
  1.4 Data Access Control
  The system enforces role-based access control (RBAC):
- Students can only access their own data
- Parents can only access linked student data
- Teachers can only access students in their assigned classes
- Learning advisors can only access students assigned to them
- Administrators can access all system data
  1.5 Permission Principles
- Least Privilege Principle: Users only access what they need
- Data Isolation: Student data is restricted by assignment
- Auditability: All critical actions are logged
- Role Clarity: Each role has clearly defined responsibilities

Student Interface Design

2. Student Workflow
   2.1 Overview
   The student workflow defines the complete lifecycle of a student within the system, from account creation to learning
   completion and performance evaluation.
   2.2 Workflow Stages
   The student journey is divided into the following stages:
1. Account Access & Onboarding
2. Course Enrollment
3. Daily Learning & Task Completion
4. Class Participation
5. Assignment & Feedback
6. Mock Exam Participation
7. Progress Tracking & Reports
   2.3 Detailed Workflow
   2.3.1 Account Access & Onboarding
   Steps:

- Student registers or logs into the system
- Student completes profile setup if first-time user
- System initializes dashboard
  System Behavior:
- Redirect first-time users to onboarding
- Require verification before full access
  2.3.2 Course Enrollment
  Steps:
- Student is enrolled into course(s)
- Courses appear under “My Courses”
- Student accesses course content
  System Behavior:
- Associate student with course data
- Load course-specific materials and tasks
  2.3.3 Daily Learning & Task Completion
  Steps:
- Student views dashboard
- System displays tasks across all courses
- Student selects and completes tasks
- Student submits work where required
  System Behavior:
- Aggregate tasks from all courses
- Prioritize tasks:
    - Overdue
    - Due today
    - Upcoming
- Update task status dynamically
- Trigger reminders for incomplete tasks
  2.3.4 Class Participation
  Steps:
- Student attends scheduled class
  System Behavior:
- Display class schedule
- Update progress
  2.3.5 Assignment & Feedback
  Steps:
- Student completes assignments
- Student submits work
- Student receives feedback and scores
  System Behavior:
- Store submission data
- Update assignment status
- Display feedback and evaluation
  2.3.6 Mock Exam Participation
  Steps:
- Student receives exam notification
- Student access exam
- Student completes exam
  System Behavior:
- Track exam status
- Record results
- Display summary
  2.3.7 Progress Tracking & Reports
  Steps:
- Student views progress
- Student accesses reports
- Student reviews feedback
  System Behavior:
- Aggregate data from all sources
- Generate reports
- Display insights and recommendations

6. My Courses
   6.3 Course Detail Section
   6.3.1 Structure
   Course-level navigation tabs include:

- Overview
- Assignments
- Exams
- Vocabulary
- Q&A
- Materials
- Reports
  Lecture structure:
- Lecture 1
- Lecture 2
- Lecture 3
  Behavior:
- Lectures are shown inside the Overview tab only
- Students can select a lecture to view all associated materials, assignments, and exams
  6.3.2 Overview
  Lecture Structure
  Each lecture includes:
- Lecture summary
- Materials (slides, readings, listening content)
- Assignments (homework, practice tasks)
- Exams (if applicable)
  Functionality
- Students can select a lecture to view all associated content
- Content is grouped by lecture, not by type
- Supports flexible pacing (not time-dependent)
- Students can:
    - Access materials
    - Submit assignments
    - Take exams
      Cross-Lecture Overview
      In addition to lecture structure, the Overview also provides a consolidated view of all content:
- Materials
- Assignments
- Exams
  Each item includes:
- Title
- Type (e.g., Homework, Quiz, Slides)
- Lecture reference
- Status
  Recorded Lessons
- Recorded lessons are unlocked based on:
    - student progress
    - or missed classes
- Students can access recorded lessons for:
    - review
    - make-up learning
- Access may be limited by:
    - expiration time
    - viewing restrictions
      6.3.3 Assignments (Global View)
      Components:
      Assignment List
      Each assignment includes:
- Assignment title
- Associated lecture
- Due date
- Status:
    - Not submitted
    - Submitted
    - Overdue
- Grade (if available)
  Functionality:
- Sorted by:
    - Overdue
    - Upcoming
    - Completed
- Clicking an assignment opens detail page:
    - Submission
    - Feedback
    - Score
      6.3.4 Exams (Course-Specific View)
      Each course has its own exam plan, and exam availability is determined by course progress milestones or
      advisor-defined settings.
      Components:
      Exam Plan / Availability
- Mock exams are unlocked based on course progress milestones
- Advisors can configure:
    - exam timing
    - exam type
    - required or optional participation
- Each exam includes:
    - availability status
    - scheduled time (if booked)
      Exam List
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
  Functionality:
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
      Behavior:
- Each course maintains its own exam plan
- Exam availability is tied to lecture progression or learning milestones
- Exam data is stored and used for performance tracking and reports
  6.3.5 Vocabulary (Global View)
  Components:
  Vocabulary List
  Each entry includes:
- Word
- Meaning / definition
- Example sentence (if available)
- Source:
    - Associated lecture
    - Assignment or exam (if applicable)
- Status:
    - New
    - Learning
    - Mastered
      Functionality:
- Vocabulary is automatically generated from:
    - incorrect answers
    - assignments
    - exams
- Students can:
    - review vocabulary
    - mark words as “learned” or “mastered”
    - revisit previously learned words
- Vocabulary items are displayed in a list format
- Supports sorting:
    - by recency (newest first)
    - by status
    - by frequency (optional)
      Behavior:
- Vocabulary is continuously updated as the student progresses
- Each word is linked back to its source context (lecture, assignment, or exam)
  6.3.6 Q&A (Course View)
  Components:
- Question input field
- Question list
  Each question includes:
- Question content
- Associated lecture (optional)
- Timestamp
- Answer status:
    - AI answered
    - Teacher answered
      Functionality:
- Students can submit questions within the course
- System provides immediate AI response
- Teachers can review and provide additional answers
- Questions are visible to:
    - student
    - teacher
    - learning advisor
      Behavior:
- Q&A is scoped to the current course
- Questions may optionally be linked to a lecture
- AI response is generated first
- Teacher response can supplement or override AI
  6.3.7 Materials (Course View)
  Components:
  Material List
  Each item includes:
- Title
- Type:
    - Recording
    - Slides
    - Document
    - Audio
- Associated lecture
- Upload date
  Functionality:
- Displays all materials across lectures
- Students can:
    - preview recordings
    - download files
- Supports filtering:
    - by lecture
    - by type (recording, slides, etc.)
      Behavior:
- Materials are still tied to lectures
- Materials tab provides a cross-lecture view
- Recordings follow restrictions:
    - limited access duration
    - no screen recording (if applicable)
      6.4 Assignment Detail View
      Assignment Information Section
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
      Description Section
- Full assignment instructions
  Attached Files Section
- List of files provided by the instructor
  Submission Section
  Input Options:
- Rich text editor
- File upload
  Components:
- Text editor
- Upload button
- Submit button
  Functionality:
- Students can submit:
    - text only
    - file only
    - or both
- Submission replaces previous submission if resubmission is allowed
- Submission status updates immediately after submission
  Submission History
  Displays past submissions (if applicable):
- Submission timestamp
- Submitted content or file
- Version history (if resubmitted)
  Feedback Section
  Displayed after grading.
  Includes:
- Score (e.g., 95/100)
- Teacher comments
- Additional feedback files (optional)
  6.5 Exam Detail View
  Exam Information Section
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
  Exam Content Section
  Question Types Supported:
  Multiple Choice
- Single correct answer
- Multiple correct answers
  Short Answer
- Text input field
  Long Answer
- Rich text editor
- Optional word count limit
  Media-Based Questions
- Questions may include:
    - Images
    - PDFs
    - Text passages
      Components per Question:
- Question number
- Question content
- Input area
- Optional attachments
  Functionality
- Students can navigate between questions
- Answers are saved automatically (if enabled)
- Students can review and modify answers before submission
  Submission Section
  Components:
- Submit button
- Confirmation prompt
  Functionality:
- Students submit the exam when complete
- System records submission time
- Submission finalizes answers
  Result & Feedback Section
  Displayed after submission.
  Components:
- Score (if available)
- Status:
    - Graded
    - Pending grading
- Feedback:
    - Automatic feedback (objective questions)
    - Teacher feedback (subjective questions)
      Functionality:
- Objective questions are auto-graded
- Subjective questions are graded manually
- Students can review:
    - correct answers (if allowed)
    - teacher comments
      Behavior
- The exam follows a linear workflow:
    1. Review instructions
    2. Answer questions
    3. Submit
    4. View results

7. Reports
   7.2 Report Types
   7.2.1 Stage Report
   Generated periodically based on learning progress.
   Includes:

- Lectures completed
- Task completion rate
- Assignment performance
- Behavioral indicators (e.g., engagement level)
- Mock exam results (if applicable)
  7.2.2 Mock Exam Report
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
  7.2.3 Final Report
  Generated at the end of the course.
  Includes:
- Overall course performance
- Learning progress summary
- Final evaluation
  Additional Analysis:
- Comparison between:
    - target score
    - actual score
      Outcome:
- If target achieved:
    - completion summary
- If target not achieved:
    - improvement recommendations:
        - required course hours
        - focus areas
        - skill improvement suggestions
          7.3 Report Detail View
          Components:
- Report title
- Course reference
- Date
  Performance Summary
- Overall score
- Key metrics
- Progress indicators
  Performance Analysis
- Section-level breakdown
- Accuracy by task type
- Weak areas
  Behavioral Insights
- Time spent on learning
- Task completion trends
- Engagement level
  Feedback Section
  Includes:
- Teacher comments (optional)
- Personalized feedback
- Recommendations for improvement
  Functionality:
- Reports are automatically generated based on Student Archive data
- Teacher feedback is optional and displayed alongside system-generated insights
  7.4 Behavior
- Reports are generated from accumulated learning data
- Reports update as new data becomes available
- Reports are read-only for students

8. OC Onboarding (Pre-Course Process)
   8.1 Overview
   The onboarding process is triggered when a student logs into the system for the first time after enrollment.
   Students must complete onboarding before accessing:

- Dashboard
- Courses
- Learning tasks
  8.2 Onboarding Flow
  Steps:

1. Student logs into the system
2. System detects onboarding is incomplete
3. Student is redirected to onboarding page
4. Student reviews onboarding content
5. Student confirms understanding
6. Student completes electronic signature
7. Onboarding is marked as completed
8. Student is granted full access to the system
   8.5 Behavior

- Onboarding must be completed once per course enrollment
- Students cannot skip onboarding
- Progress is saved if onboarding is incomplete
- Students can resume onboarding from where they left off
  8.6 Access Control
- Before completion:
    - Dashboard and course access are restricted
- After completion:
    - Full system access is granted

9. Student Profile
   9.1 Overview
   The Student Profile serves as a centralized hub for:

- Personal information
- Learning progress
- Performance history
- Activity records
  9.3 Basic Information
  Components:
- Student name
- Account information (email / phone)
- Enrolled courses
- Enrollment status
  Functionality:
- Displays student’s basic profile information
- Limited editing allowed (e.g., nickname, phone)
  9.4 Learning Progress
  Components:
- Course progress indicators
- Lecture completion status
- Task completion rate
  Functionality:
- Displays progress across all courses
- Updates dynamically based on:
    - completed lectures
    - completed tasks
    - participation
      9.5 Performance Summary
      Components:
- Assignment performance (average score)
- Mock exam results
- Section-level performance (if available)
- Weak areas
  Functionality:
- Aggregates performance data across:
    - assignments
    - exams
- Highlights:
    - strengths
    - weaknesses
      9.6 Activity History
      Components:
- Task completion records
- Assignment submissions
- Exam attempts
- Attendance (if applicable)
  Functionality:
- Displays chronological activity timeline
- Allows students to review past actions
  9.7 Behavior
- Profile data is continuously updated
- Data is read-only except for basic information
- Profile reflects real-time learning status

10. AI ChatBot
    10.2 Chat Behavior

- The AI responds first to student questions
- Responses are context-aware and may relate to the student’s current course or task
- The chatbot can help explain:
    - assignments
    - lectures
    - exam questions
    - vocabulary
    - reports
- The chatbot should not replace teacher feedback, but act as an immediate support tool

Teacher Interface

2. Teacher Workflow
   2.1 Overview
   The teacher workflow defines the sequence of actions a teacher performs to deliver instruction, evaluate students,
   and provide feedback.
   2.2 Workflow Stages
   The teacher workflow consists of the following stages:
1. Class Preparation
2. Class Delivery
3. Attendance Recording
4. Assignment Grading
5. Exam Evaluation
6. Student Support (Q&A)
7. Performance Feedback
   2.3 Detailed Workflow
   2.3.1 Class Preparation
   Steps:

- Teacher logs into the system
- Teacher views upcoming classes
- Teacher selects a class
  System Behavior:
- Displays:
    - course information
    - lecture content
    - student list
- Provides visibility into:
    - student progress
    - weak areas
    - incomplete tasks
      2.3.2 Class Delivery
      Steps:
- Teacher conducts the class
- Teacher references lecture materials and content
  System Behavior:
- Displays lecture structure
- Allows access to:
    - materials
    - assignments
    - relevant content
      2.3.3 Attendance Recording
      Steps:
- Teacher marks student attendance
  System Behavior:
- Records attendance status
- Updates student progress
- Triggers:
    - recording unlock (if student absent)
      2.3.4 Assignment Grading
      Steps:
- Teacher reviews submitted assignments
- Teacher provides score and feedback
  System Behavior:
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
      2.3.5 Exam Evaluation
      Steps:
- Teacher reviews exam results
- Teacher evaluates subjective responses
  System Behavior:
- Automatically grades objective questions
- Provides interface for:
    - manual grading
    - feedback
- Updates exam results and student performance
  2.3.6 Student Support (Q&A)
  Steps:
- Teacher reviews student questions
- Teacher provides answers
  System Behavior:
- Displays:
    - AI-generated response
    - student question history
- Allows teacher to:
    - add response
    - edit or refine answers
      2.3.7 Performance Feedback
      Steps:
- Teacher reviews student performance
- Teacher provides feedback
  System Behavior:
- Displays:
    - student progress
    - assignment results
    - exam results
- Allows:
    - comments
    - recommendations
      2.4 Behavior
- Workflow is continuous and iterative
- Teacher actions directly update:
    - student progress
    - reports
    - performance data

5. My Classes
   5.3 Class Detail Section
   Structure
   Course-level navigation tabs include:

- Overview
- Assignments
- Exams
- Vocabulary
- Q&A
- Materials
  Lecture structure:
- Lecture 1
- Lecture 2
- Lecture 3
  Behavior:
- Lectures are displayed inside the Overview tab
- Teachers can select a lecture to manage its content
  Overview Tab
  Each lecture includes:
- Lecture summary
- Materials (slides, readings, recordings)
- Assignments
- Exams
  Functionality:
  Teachers can:
- Create new lectures
- Edit lecture summaries
- Upload materials to lectures
- Attach assignments and exams to lectures
  Assignments Tab
  Components:
  Assignment List
  Each assignment includes:
- Assignment title
- Associated lecture
- Due date
- Status
- Submission count
  Functionality:
  Teachers can:
- Create assignments
- Upload assignment files
- Edit instructions and due dates
- View student submissions
- Grade assignments
- Provide feedback
- Upload feedback files
  Exams Tab
  Components:
  Exam List
  Each exam includes:
- Exam title
- Lecture reference
- Exam type
- Status
- Student participation
  Functionality:
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
  Vocabulary Tab
  Functionality:
  Teachers can:
- Review vocabulary lists
- Add or edit vocabulary entries
  Q&A Tab
  Functionality:
  Teachers can:
- View student questions
- Respond to questions
- Refine AI-generated responses
- Track unanswered questions
  Materials Tab
  Components:
  Material List
  Each item includes:
- Title
- Type (Recording, Slides, Document, Audio)
- Associated lecture
- Upload date
  Functionality:
  Teachers can:
- Upload materials
- Manage files
- Control visibility
  5.4 Attendance Recording
  Components:
  Student List with attendance controls
  Each student includes:
- Name
- Attendance status
  Functionality:
  Teachers can:
- Mark students as present or absent
- Record attendance in real time
  Behavior:
- Attendance updates student progress
- If a student is marked absent:
    - corresponding recorded lesson is unlocked
      5.5 Behavior
- The Class Detail page reflects real-time data
- Teacher actions update:
    - student progress
    - assignments
    - exams
    - reports

6. Reports
   6.2 Report Detail View
   Teacher Feedback Section
   Teachers can:

- Add comments
- Provide personalized feedback
- Suggest improvements
  Functionality:
- Teacher can edit or update feedback at any time
- Feedback is saved and reflected in the student view
- Teacher feedback is optional
  6.3 Behavior
- Reports are generated automatically by the system
- Reports are immediately visible to students
- Teachers do not need to approve reports

Parent Interface

2. Parent Workflow
   2.1 Overview
   The parent workflow defines how parents monitor the student’s learning status, review progress information, and
   submit absence requests when necessary.
   2.2 Workflow Stages
   The parent journey is divided into the following stages:
1. Account Access & Monitoring Setup
2. Student Status Review
3. Attendance Review
4. Absence Request Submission
5. Reports & Feedback Review
   2.3 Detailed Workflow
   2.3.1 Account Access & Monitoring Setup
   Steps:

- Parent logs into the system
- Parent enters the dashboard
- Parent views the linked student’s summary information
  System Behavior:
- Displays the student’s current status immediately after login
  2.3.2 Student Status Review
  Steps:
- Parent reviews the student’s current learning status
- Parent checks progress, remaining hours, and latest updates
  System Behavior:
- Displays:
    - student profile summary
    - remaining course hours
    - attendance status
    - latest feedback
    - latest report summary
      2.3.3 Attendance Review
      Steps:
- Parent checks whether the student has attended recent classes
- Parent reviews any missed or marked-absent sessions
  System Behavior:
- Displays attendance history
- Clearly marks:
    - present
    - absent
    - approved absence
    - unapproved absence
- Shows whether an absence has been charged or exempted
  2.3.4 Absence Request Submission
  Steps:
- Parent selects a class session
- Parent submits an absence request with reason
- Parent optionally provides supporting information if needed
  System Behavior:
- Creates an absence request record
- Sends the request to the advisor for review
- Updates request status:
    - pending
    - approved
    - rejected
      Business Rule:
- If the absence is approved by the advisor, the session is not charged
- If the absence is rejected, the session is charged normally
  2.3.5 Reports & Feedback Review
  Steps:
- Parent views student reports
- Parent reads teacher feedback and performance comments
  System Behavior:
- Displays the latest reports
- Shows teacher feedback in read-only format
  2.4 Behavior
- The parent workflow is mainly read-only
- The only active action is absence request submission
- All viewing data is updated in real time

6. Attendance & Hours
   6.2 Attendance History
   Components:
   Attendance List
   Each entry includes:

- Class date
- Lecture reference
- Attendance status:
    - present
    - absent
    - approved absence
    - unapproved absence
      6.3 Course Hours Summary
      Components:
- Total purchased hours
- Hours used
- Remaining hours
  Functionality:
- Updates dynamically based on attendance records
- Reflects whether a session is charged or not
  6.4 Absence Requests
  Components:
  Absence Request Form
  Includes:
- Class / lecture selection
- Reason for absence
- Optional notes
  Absence Request List
  Each request includes:
- Class reference
- Submission time
- Status:
    - pending
    - approved
    - rejected
      Functionality:
- Parents can submit an absence request for a class
- Requests are sent to the advisor for review
- Parents can track request status
  6.5 Behavior
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

7. Reports
   7.2 Report Types
   7.2.1 Stage Report
   7.2.2 Mock Exam Report
   7.2.3 Final Report
   7.3 Report Detail View
   Functionality:

- Reports are automatically generated based on student learning data
- Reports are read-only for parents
- Reports can only be accessed during the active report period
  7.4 Behavior
- Reports are available only during teacher-defined periods
- Once the report period ends, the report is no longer accessible
- Reports are not editable by parents

8. Feedback
   8.1 Page Layout
   Components:
   Feedback List
   Each entry includes:

- Course name
- Lecture reference (e.g., Lecture 3)
- Feedback type:
    - Lecture feedback
    - Assignment feedback
- Date
- Short summary
  8.2 Feedback Detail View
  Components:
- Course reference
- Lecture reference
- Date
- Feedback type
  Feedback Content
  Includes:
- Teacher comments
- Performance observations
- Areas for improvement
- Additional notes (if any)
  Functionality:
- Feedback is displayed in read-only format
- Parents can review feedback at any time
- Feedback is linked to the corresponding lecture or assignment
  8.3 Behavior
- Feedback is continuously generated as the student progresses
- Feedback is immediately visible once provided by the teacher
- Feedback is not restricted by time periods (unlike reports)
- Feedback history is retained and accessible