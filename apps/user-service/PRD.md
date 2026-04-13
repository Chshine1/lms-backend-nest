# Overall Architecture

## Overview

This page should be the first page users see when trying to use the product. Users cannot use the product without
an appropriate account and registration.

This page should contain the following functions:

- Sign up and log in with a Coursistant account `[User Aggregate, RegistrationDomainService]`
- Sign up and log in with phone number `[User Aggregate.phoneNumber, updatePhoneNumber method]`
- Sign up and log in with a third-party account (QQ/WeChat/SMS) `[Missing Model]`
- When signing up for a Coursistant account, there should be a verification email. `[EmailVerificationRequested event]`

## Sign-up Information

Sign-up pages are only allowed for student and parent accounts. Teacher or other staff accounts need to be created by
admin. `[BR-01, RoleApplicationService]`

1.  **Nickname**

- Editable after registration `[Missing Model]`

2.  **Email Address**

- Used for account identification and login `[User Aggregate.email]`
- Must be unique `[User Aggregate.email (UNIQUE)]`
- Cannot be modified after registration `[User Aggregate.email (immutable), BR-03]`

3.  **Phone Number**

- Used for login and communication `[User Aggregate.phoneNumber]`
- Supports international formats `[PhoneNumber Value Object (E.164)]`
- Can be updated in account settings `[User Aggregate.updatePhoneNumber method]`

4.  **Password**

- Used for secure login `[User Aggregate.hashedPassword]`
- Can be changed after verification `[User Aggregate.updatePassword method]`

5.  **Invitation Code (Optional)**

- Used for internal testing or organization-based onboarding `[Tenant Aggregate.invitationCode]`

---

# User Roles & Permissions

## 1.1 Overview

The system supports multiple user roles with distinct responsibilities and access permissions.

User roles are divided into:

- End Users (students and parents)
- Operational Users (teachers and learning advisors)
- System Administrator

`[Role Aggregate]`

## 1.2 User Roles Definition

### 1.2.1 Student

**Access Scope:**

- Own profile and learning data only `[AuthorizationService (Static Permission)]`

### 1.2.2 Parent

**Access Scope:**

- Linked student(s) data only `[AuthorizationService (Relationship-based permission, ParentStudentLink)]`
- Read-only access (no modification rights) `[AuthorizationService (Permission tag check)]`

### 1.2.3 Teacher

**Access Scope:**

- Students within assigned classes only `[Missing Model]`
- Teaching-related data only `[Missing Model]`

### 1.2.4 Learning Advisor

**Access Scope:**

- Assigned students only `[Missing Model]`
- Full access to student learning data `[Missing Model]`
- Ability to edit planning and feedback `[Missing Model]`

### 1.2.5 System Administrator

**Access Scope:**

- Full system access `[Role Aggregate (Administrator permission tag)]`
- Cross-role visibility `[Role Aggregate]`
- Configuration and audit control `[Role Aggregate]`

## 1.3 Role Assignment Rules

- Students and Parents can self-register through the system `[RegistrationDomainService, BR-01]`
- Teachers, Learning Advisors, and Admins must be created by the system administrator `[RoleApplicationService, BR-01]`
- Each user must have at least one role assigned `[UserRoleAssignment Entity (New Addition)]`
- A user may have multiple roles if required (e.g., Admin + Teacher) `[UserRoleAssignment Entity (New Addition)]`

## 1.4 Data Access Control

The system enforces role-based access control (RBAC):

- Students can only access their own data `[AuthorizationService]`
- Parents can only access linked student data `[AuthorizationService, ParentStudentLink]`
- Teachers can only access students in their assigned classes `[Missing Model]`
- Learning advisors can only access students assigned to them `[Missing Model]`
- Administrators can access all system data `[AuthorizationService]`

## 1.5 Permission Principles

- **Least Privilege Principle:** Users only access what they need `[AuthorizationService]`
- **Data Isolation:** Student data is restricted by assignment `[AuthorizationService]`
- **Auditability:** All critical actions are logged `[Missing Model]`
- **Role Clarity:** Each role has clearly defined responsibilities `[Role Aggregate]`

---

# 8. OC Onboarding (Pre-Course Process)

## 8.1 Overview

The onboarding process is triggered when a student logs into the system for the first time after enrollment.

Students must complete onboarding before accessing:

- Dashboard
- Courses
- Learning tasks

`[StudentProfile Aggregate, BR-04]`

## 8.2 Onboarding Flow

**Steps:**

1.  Student logs into the system `[Missing Model]`
2.  System detects onboarding is incomplete `[StudentProfile.onboardingStatus]`
3.  Student is redirected to onboarding page `[Missing Model]`
4.  Student reviews onboarding content `[Missing Model]`
5.  Student confirms understanding `[Missing Model]`
6.  Student completes electronic signature `[Missing Model]`
7.  Onboarding is marked as completed `[StudentProfile.completeOnboarding method]`
8.  Student is granted full access to the system `[BR-04]`

## 8.5 Behavior

- Onboarding must be completed once per course enrollment `[Missing Model]`
- Students cannot skip onboarding `[Missing Model]`
- Progress is saved if onboarding is incomplete `[Missing Model]`
- Students can resume onboarding from where they left off `[Missing Model]`

## 8.6 Access Control

- **Before completion:** Dashboard and course access are restricted `[BR-04]`
- **After completion:** Full system access is granted `[BR-04]`

---

# 9. Student Profile

## 9.1 Overview

The Student Profile serves as a centralized hub for:

- Personal information
- Learning progress
- Performance history
- Activity records

`[StudentProfile Aggregate]`

## 9.3 Basic Information

**Components:**

- Student name `[Missing Model]`
- Account information (email / phone) `[User Aggregate]`
- Enrolled courses `[Missing Model]`
- Enrollment status `[Missing Model]`

**Functionality:**

- Displays student's basic profile information `[StudentProfile Aggregate]`
- Limited editing allowed (e.g., nickname, phone) `[User Aggregate.updatePhoneNumber, nickname editing missing]`
