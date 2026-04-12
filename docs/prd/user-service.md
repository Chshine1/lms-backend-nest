# Overall Architecture

## Overview

This page should be the first page users should see when trying to use the product. Users cannot use the product without an appropriate account and registration.

This page should contain the following functions:

- Sign up and log in with a Coursistant account
- Sign up and log in with phone number
- Sign up and log in with a third-party account (QQ/Wechat/SMS)
- When signing up for a Coursistant account, there should be a verification email.

## Sign-up Information

Sign-up pages are only allowed for student and parent accounts. Teacher or other staff accounts need to be created by admin.

1. **Nickname**
    - Editable after registration

2. **Email Address**
    - Used for account identification and login
    - Must be unique
    - Cannot be modified after registration

3. **Phone Number**
    - Used for login and communication
    - Supports international formats
    - Can be updated in account settings

4. **Password**
    - Used for secure login
    - Can be changed after verification

5. **Invitation Code (Optional)**
    - Used for internal testing or organization-based onboarding

---

# User Roles & Permissions

## 1.1 Overview

The system supports multiple user roles with distinct responsibilities and access permissions.

User roles are divided into:

- End Users (students and parents)
- Operational Users (teachers and learning advisors)
- System Administrator

## 1.2 User Roles Definition

### 1.2.1 Student (学生)

**Access Scope:**
- Own profile and learning data only
- Own reports, tasks, and progress

### 1.2.2 Parent (家长)

**Access Scope:**
- Linked student(s) data only
- Read-only access (no modification rights)

### 1.2.3 Teacher (教师)

**Access Scope:**
- Students within assigned classes only
- Teaching-related data only

### 1.2.4 Learning Advisor (学导)

**Access Scope:**
- Assigned students only
- Full access to student learning data
- Ability to edit planning and feedback

### 1.2.5 System Administrator (管理员)

**Access Scope:**
- Full system access
- Cross-role visibility
- Configuration and audit control

## 1.3 Role Assignment Rules

- Students and Parents can self-register through the system
- Teachers, Learning Advisors, and Admins must be created by the system administrator
- Each user must have at least one role assigned
- A user may have multiple roles if required (e.g., Admin + Teacher)

## 1.4 Data Access Control

The system enforces role-based access control (RBAC):

- Students can only access their own data
- Parents can only access linked student data
- Teachers can only access students in their assigned classes
- Learning advisors can only access students assigned to them
- Administrators can access all system data

## 1.5 Permission Principles

- **Least Privilege Principle:** Users only access what they need
- **Data Isolation:** Student data is restricted by assignment
- **Auditability:** All critical actions are logged
- **Role Clarity:** Each role has clearly defined responsibilities

---

# 8. OC Onboarding (Pre-Course Process)

## 8.1 Overview

The onboarding process is triggered when a student logs into the system for the first time after enrollment.

Students must complete onboarding before accessing:
- Dashboard
- Courses
- Learning tasks

## 8.2 Onboarding Flow

**Steps:**

1. Student logs into the system
2. System detects onboarding is incomplete
3. Student is redirected to onboarding page
4. Student reviews onboarding content
5. Student confirms understanding
6. Student completes electronic signature
7. Onboarding is marked as completed
8. Student is granted full access to the system

## 8.5 Behavior

- Onboarding must be completed once per course enrollment
- Students cannot skip onboarding
- Progress is saved if onboarding is incomplete
- Students can resume onboarding from where they left off

## 8.6 Access Control

- **Before completion:** Dashboard and course access are restricted
- **After completion:** Full system access is granted

---

# 9. Student Profile

## 9.1 Overview

The Student Profile serves as a centralized hub for:
- Personal information
- Learning progress
- Performance history
- Activity records

## 9.3 Basic Information

**Components:**
- Student name
- Account information (email / phone)
- Enrolled courses
- Enrollment status

**Functionality:**
- Displays student's basic profile information
- Limited editing allowed (e.g., nickname, phone)

---

# Parent Interface

## 6.4 Absence Requests

**Components:**

### Absence Request Form

Includes:
- Class / lecture selection
- Reason for absence
- Optional notes

### Absence Request List

Each request includes:
- Class reference
- Submission time
- Status:
    - pending
    - approved
    - rejected

**Functionality:**
- Parents can submit an absence request for a class
- Requests are sent to the advisor for review
- Parents can track request status