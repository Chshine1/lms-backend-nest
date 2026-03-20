## Course Microservice Analysis and Partitioning Recommendations

Based on the provided Use Case document, we have extracted and analyzed the core responsibilities, data models, and
business processes for the course microservice. The course microservice is positioned to **focus on the static
definition of courses and basic resource management**, excluding dynamic teaching data such as student participation,
learning reports, and communication records. The following sections provide a detailed explanation from four aspects: *
*Model Classes**, **Core Processes**, **Missing Information**, and **Service Partitioning Options**.

---

### I. Course Microservice Boundary Definition

**Responsibilities**

- Manage basic course information (name, subject, level, total hours, schedule, time, etc.)
- Manage campus and classroom resources
- Manage course materials (handouts, documents, PPTs, etc.)
- Manage metadata for recorded videos (excluding playback progress and unlock status)
- Provide static associations between courses and teachers/classrooms (only record teacher ID, do not maintain teacher
  schedules)

**Excluded Responsibilities**

- Student enrollment
- Teacher schedule and availability management
- Student learning progress, assignments, grades, feedback
- Mock exams, reports, communication records
- Account permissions, system configuration, audit logs

---

### II. Model Class (Entity) Definitions

---

### III. Core Business Processes

#### 1. Course Creation Process (based on UC-SCHED-02)

**Description**: This is a cross-service business process. The course microservice is only responsible for persisting
the course definition; coordination logic should be handled by an upper orchestration service (e.g., BFF or workflow
engine).

**Steps and Interactions**:

1. Academic affairs frontend submits basic course information (name, subject, time, campus, classroom specifications,
   etc.).
2. **Orchestration service** receives the request and sequentially invokes the following services:
    - Call **Teacher Service**: Check teacher availability and temporarily lock the teacher's time (skip if teacher not
      yet determined).
    - Call **Classroom Service** (may belong to course microservice or a separate resource service): Check classroom
      availability and temporarily lock.
    - Call **Student Service** (or Enrollment Service): Retrieve information of students to be enrolled and verify their
      time preferences.
    - Call **Scheduling Suggestion Engine** (optional): Generate optimized suggestions (if intelligent suggestions
      enabled).
3. Orchestration service returns the suggested plan to the frontend; academic affairs confirms or adjusts.
4. After confirmation, orchestration service invokes again:
    - **Teacher Service**: Formally occupy teacher's time.
    - **Classroom Service**: Formally occupy classroom.
    - **Student Service**: Enroll students.
    - **Course Microservice**: Create course record (including teacher ID, classroom ID, etc.).
5. After all calls succeed, orchestration service triggers notifications.

**Missing/To be clarified**:

- Specific method for obtaining teacher availability data (API definition).
- Storage location and retrieval method for student time preferences.
- Rule details for scheduling suggestion engine (e.g., teacher cross-campus cost calculation, student convenience
  scoring algorithm).
- Transaction consistency requirements (distributed transaction required, or eventual consistency allowed).

#### 2. Course Material Upload Process (based on UC-MAT-01)

**Steps**:

1. Teacher uploads file to course microservice (or directly to file storage, then submits metadata).
2. Course microservice validates file format and size.
3. Call **File Storage Service** to save the file and return URL.
4. Course microservice creates `CourseMaterial` record, associating it with the course.
5. Optional: Trigger notification service to inform students of new material.

**Missing/To be clarified**:

- Interface specification for file storage service.
- Specific mechanism for file version control (auto-overwrite or create new version).
- Implementation of visibility scope and permission verification (whether interaction with enrollment service is needed
  to verify student identity).

#### 3. Recorded Video Management Process (based on UC-VOD-01)

**Steps**:

1. Teacher/academic affairs uploads video (or links external video).
2. Course microservice records video metadata (including unlock conditions, validity period).
3. When students play the video, they must verify unlock conditions (e.g., learning progress) through **Learning Service
   **, which calls course microservice to retrieve video information.
4. Course microservice cooperates with DRM service to generate a watermarked playback token.

**Missing/To be clarified**:

- Specific rule configuration for unlock conditions (e.g., "complete prerequisite video", "mock exam score meets
  standard").
- Validity period control strategy (absolute time or relative time).
- Implementation of DRM and anti-screen recording (third-party service integration).

---

### IV. Key Service Partitioning Options and Trade-off Analysis

#### Option 1: Place Student Enrollment within Course Microservice

**Advantages**:

- Course creation can complete both course definition and enrollment in one transaction, simplifying the process.
- Course material access permission verification can be done directly within this service (by querying enrollment
  relationships).
- Convenient to query student list for a course without cross-service calls.

**Disadvantages**:

- Course microservice's responsibilities expand to include dynamic enrollment data, deviating from the "static course"
  intention.
- When student count is huge, the enrollment table may become a performance bottleneck (though can be mitigated by
  sharding).
- If the student service needs to query a student's course list, it must call the course service, creating coupling.

#### Option 2: Place Enrollment in a Separate Student Service or Enrollment Service

**Advantages**:

- Course microservice remains pure, focusing only on static course definitions.
- Student service can uniformly manage all student enrollments, facilitating construction of student schedules and
  learning profiles.
- Clear service boundaries, aligning with single responsibility principle.

**Disadvantages**:

- Course creation process requires cross-service calls, increasing complexity and latency.
- Course material permission verification needs to query the student service, adding one RPC.
- Atomicity between course creation and enrollment may require distributed transactions (Saga or TCC), increasing
  development cost.

**Compromise**: Course microservice stores only course definitions, but synchronizes enrollment data via events to a
read-only view for permission verification. This maintains single responsibility while improving query performance, but
introduces eventual consistency and additional storage.

#### Option 3: Teacher Assignment within Course Microservice

Teacher assignment (recording which teacher teaches the course) is part of the static course definition and is
recommended to be placed in the course microservice. However, teacher schedule locking should be handled by the teacher
service. The course microservice only records the teacher ID, not the teacher's schedule.

#### Option 4: Classroom Resource Management

Classrooms and campuses are basic resources closely related to courses, and it is recommended to include them in the
course microservice. However, classroom availability checking and occupancy need to be independent of course definition;
the course microservice can provide APIs for scheduling calls, or these can be split into a separate resource service.
If classrooms might be used by other businesses (e.g., events), they could be independent as a resource service.

#### Option 5: Scheduling Suggestion Engine

Scheduling suggestions involve complex rules such as teacher availability, student preferences, and cross-campus costs.
It is recommended to make it an independent microservice to avoid bloating the course microservice. The course
microservice only needs to provide course definition interfaces for the suggestion engine to call.

---

### V. Summary of Missing or To-be-clarified Items

1. **Subject and Level Dictionary**: Need standardized subject and level enums, or support dynamic configuration.
2. **Existence of Teacher Service**: Document does not clarify the responsibility boundaries of the teacher service;
   confirm whether there is an independent teacher service managing teacher basic information, schedules, contracts,
   etc.
3. **Student Time Preferences**: How are student time preferences obtained and stored? Maintained by the student
   service?
4. **Scheduling Rule Details**:
    - Formula for teacher cross-campus cost.
    - Student convenience scoring algorithm.
    - Definition of academic burden indicators.
5. **Classroom Status and Equipment**: Does classroom need to maintain availability status and equipment list?
6. **Course Material Version Control**: When uploading a file with the same name, should a new version be automatically
   created? How are historical versions retained?
7. **Recorded Video Unlock Conditions**: Supported rule types (e.g., "complete prerequisite video", "mock exam score
   meets standard", "manually unlocked") require an extensible rule expression design.
8. **DRM and Anti-Screen Recording**: Is integration with a third-party service needed? What information should dynamic
   watermarks display?
9. **Notification Mechanism**: Who triggers notifications after course creation and material upload? Is an independent
   notification service needed?
10. **Transaction Consistency Requirements**: Course creation involves multiple services; is partial failure allowed? If
    teacher is locked but student enrollment fails, should the course be rolled back?

---

### VI. Conclusion

The course microservice should focus on **static course definitions and basic resources**, including core entities such
as campus, classroom, course, course material, and recorded video metadata. Typical operations include CRUD for courses,
material upload, and video management, but it does not involve dynamic data such as student enrollment, teacher
schedules, or learning progress. Complex business processes like course creation should be coordinated by an upper
orchestration service that invokes multiple microservices, with the course microservice providing only basic APIs.

During implementation, based on business consistency requirements and team technology stack, trade-offs should be
considered for **enrollment ownership**, **independence of scheduling suggestion engine**, etc., and the missing
details (e.g., subject dictionary, unlock rules, transaction strategy) should be supplemented. It is recommended to
adopt domain-driven design to clearly separate the course context from teaching and learning contexts, ensuring clear
microservice boundaries and maintainability.