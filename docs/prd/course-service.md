# Student Interface Design

## 6. My Courses

### 6.3 Course Detail Section

#### 6.3.1 Structure

Course-level navigation tabs include:
- Overview
- Assignments
- Exams
- Vocabulary
- Q&A
- Materials
- Reports

**Lecture structure:**
- Lecture 1
- Lecture 2
- Lecture 3

**Behavior:**
- Lectures are shown inside the Overview tab only
- Students can select a lecture to view all associated materials, assignments, and exams

#### 6.3.2 Overview

**Lecture Structure**

Each lecture includes:
- Lecture summary
- Materials (slides, readings, listening content)
- Assignments (homework, practice tasks)
- Exams (if applicable)

**Functionality**
- Students can select a lecture to view all associated content
- Content is grouped by lecture, not by type
- Supports flexible pacing (not time-dependent)
- Students can:
    - Access materials
    - Submit assignments
    - Take exams

**Cross-Lecture Overview**

In addition to lecture structure, the Overview also provides a consolidated view of all content:
- Materials
- Assignments
- Exams

Each item includes:
- Title
- Type (e.g., Homework, Quiz, Slides)
- Lecture reference
- Status

**Recorded Lessons**
- Recorded lessons are unlocked based on:
    - student progress
    - or missed classes
- Students can access recorded lessons for:
    - review
    - make-up learning
- Access may be limited by:
    - expiration time
    - viewing restrictions

#### 6.3.5 Vocabulary (Global View)

**Components:**

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

**Functionality:**
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

**Behavior:**
- Vocabulary is continuously updated as the student progresses
- Each word is linked back to its source context (lecture, assignment, or exam)

#### 6.3.7 Materials (Course View)

**Components:**

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

**Functionality:**
- Displays all materials across lectures
- Students can:
    - preview recordings
    - download files
- Supports filtering:
    - by lecture
    - by type (recording, slides, etc.)

**Behavior:**
- Materials are still tied to lectures
- Materials tab provides a cross-lecture view
- Recordings follow restrictions:
    - limited access duration
    - no screen recording (if applicable)

---

# Teacher Interface

## 5. My Classes

### 5.3 Class Detail Section

**Structure**

Course-level navigation tabs include:
- Overview
- Assignments
- Exams
- Vocabulary
- Q&A
- Materials

**Lecture structure:**
- Lecture 1
- Lecture 2
- Lecture 3

**Behavior:**
- Lectures are displayed inside the Overview tab
- Teachers can select a lecture to manage its content

#### Overview Tab

Each lecture includes:
- Lecture summary
- Materials (slides, readings, recordings)
- Assignments
- Exams

**Functionality:**

Teachers can:
- Create new lectures
- Edit lecture summaries
- Upload materials to lectures
- Attach assignments and exams to lectures

#### Materials Tab

**Components:**

Material List

Each item includes:
- Title
- Type (Recording, Slides, Document, Audio)
- Associated lecture
- Upload date

**Functionality:**

Teachers can:
- Upload materials
- Manage files
- Control visibility

#### Vocabulary Tab

**Functionality:**

Teachers can:
- Review vocabulary lists
- Add or edit vocabulary entries