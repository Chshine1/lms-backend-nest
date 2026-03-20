#### 1. Classroom

| Field         | Type    | Description                                              | Missing/To be clarified                                        |
|---------------|---------|----------------------------------------------------------|----------------------------------------------------------------|
| classroomId   | Long    | Unique identifier for the classroom                      | -                                                              |
| campusId      | Long    | Associated campus ID                                     | -                                                              |
| name          | String  | Classroom number/name                                    | -                                                              |
| capacity      | Integer | Maximum occupancy                                        | -                                                              |
| specification | String  | Specification description (e.g., "multimedia classroom") | Document only mentions "classroom specification", not detailed |
| equipment     | String  | Equipment list (projector, whiteboard, etc.)             | Not defined                                                    |
| status        | Enum    | Available/maintenance/reserved                           | Not defined, but needed for scheduling                         |
| remarks       | String  | Remarks                                                  | -                                                              |

#### 2. Course

| Field            | Type         | Description                                | Missing/To be clarified                    |
|------------------|--------------|--------------------------------------------|--------------------------------------------|
| courseId         | Long         | Unique identifier for the course           | -                                          |
| name             | String       | Course name                                | -                                          |
| subject          | String/Enum  | Subject (e.g., English, Math)              | Subject dictionary not defined             |
| level            | String/Enum  | Level (beginner, intermediate, advanced)   | Level dictionary not defined               |
| totalHours       | Integer      | Total class hours                          | -                                          |
| lessonDuration   | Integer      | Duration per lesson (minutes)              | -                                          |
| schedulePattern  | String       | Class cycle (e.g., "Monday and Wednesday") | Format not standardized                    |
| fixedTime        | String       | Fixed time period (e.g., "09:00-11:00")    | Format not standardized                    |
| campusId         | Long         | Associated campus ID                       | -                                          |
| classroomId      | Long         | Associated classroom ID (optional)         | -                                          |
| capacity         | Integer      | Maximum course capacity                    | -                                          |
| waitlistStrategy | Boolean/Enum | Whether to enable waitlist                 | Waitlist strategy details not defined      |
| teacherId        | String       | Teacher ID (external reference)            | Existence of teacher service not clarified |
| status           | Enum         | Draft/published/in-progress/completed      | Not defined                                |
| createdBy        | String       | Creator ID                                 | -                                          |
| createTime       | DateTime     | Creation time                              | -                                          |
| updateTime       | DateTime     | Last modification time                     | -                                          |

#### 3. CourseMaterial

| Field         | Type     | Description                                                 | Missing/To be clarified                 |
|---------------|----------|-------------------------------------------------------------|-----------------------------------------|
| materialId    | Long     | Unique identifier for the material                          | -                                       |
| courseId      | Long     | Associated course ID                                        | -                                       |
| title         | String   | Title                                                       | -                                       |
| description   | String   | Description                                                 | -                                       |
| fileUrl       | String   | File access URL                                             | Depends on file storage service         |
| fileType      | String   | File type (pdf/ppt/doc)                                     | -                                       |
| fileSize      | Long     | File size (bytes)                                           | -                                       |
| visibility    | Enum     | Visibility scope (teacher-only/student-only/parent-visible) | Specific enum values not defined        |
| allowDownload | Boolean  | Whether download is allowed                                 | -                                       |
| version       | Integer  | Version number                                              | Version control mechanism not specified |
| uploaderId    | String   | Uploader ID                                                 | -                                       |
| uploadTime    | DateTime | Upload time                                                 | -                                       |
| updateTime    | DateTime | Modification time                                           | -                                       |

#### 4. CourseVideo

| Field           | Type        | Description                                              | Missing/To be clarified              |
|-----------------|-------------|----------------------------------------------------------|--------------------------------------|
| videoId         | Long        | Unique identifier for the video                          | -                                    |
| courseId        | Long        | Associated course ID                                     | -                                    |
| chapterName     | String      | Chapter name                                             | -                                    |
| videoUrl        | String      | Video playback URL                                       | Depends on video service/DRM         |
| unlockCondition | JSON/String | Unlock condition (e.g., "complete prerequisite video X") | Rule format not defined              |
| validityPeriod  | Date        | Expiration date                                          | Configurable, but unit not specified |
| enableDrm       | Boolean     | Whether to enable DRM                                    | -                                    |
| sortOrder       | Integer     | Sort order                                               | -                                    |
| uploaderId      | String      | Uploader ID                                              | -                                    |
| uploadTime      | DateTime    | Upload time                                              | -                                    |
| updateTime      | DateTime    | Modification time                                        | -                                    |

---