## 一、微服务划分概览

| 服务名称        | 核心职责                                   | 相关用例                                                       |
|-------------|----------------------------------------|------------------------------------------------------------|
| **用户服务**    | 管理用户（学生、家长、教师、教务等）基本信息、账户、角色、联系方式及关联关系 | UC-INFO-01, UC-INFO-02, UC-CLASS-01, UC-POST-02, UC-OC-01  |
| **课程服务**    | 管理课程基本信息、课时包、课程资料、容量规则等静态内容            | UC-WS-01, UC-WS-03, UC-MAT-01, UC-LEARN-01, UC-PLAN-01     |
| **排课服务**    | 管理课程排期（班次）、教师分配、教室资源、调课/取消、智能排课建议      | UC-CL-01, UC-SCHED-01, UC-SCHED-02, UC-ATT-01, UC-CLASS-01 |
| **选课服务**    | 管理学生选课、候补队列、名额释放、预约权限控制                | UC-WS-01, UC-WS-02, UC-WS-03, UC-CL-01                     |
| **课时服务**    | 管理学生课时余额、消耗、有效期、预警                     | UC-MON-01, UC-ATT-01                                       |
| **支付/订单服务** | 处理订单、支付、退款、财务流水                        | UC-WS-03, UC-POST-01                                       |
| **试听服务**    | 管理试听申请、审批、排期                           | UC-TRIAL-01, UC-TRIAL-02                                   |
| **课堂服务**    | 管理点名、课堂反馈、课堂材料分发                       | UC-ATT-01, UC-FEED-01, UC-MAT-01                           |
| **学习服务**    | 管理学习任务、进度跟踪、错题本、生词本、预习检查               | UC-LEARN-01, UC-LEARN-02, UC-LEARN-03, UC-PLAN-01          |
| **考试服务**    | 管理模考计划、真考成绩录入、AI诊断报告、学习计划建议            | UC-MOCK-01, UC-EXAM-01, UC-EXAM-02                         |
| **报告服务**    | 生成月度运营报表、阶段性学习报告、真考报告等                 | UC-REP-01, UC-REPORT-02                                    |
| **消息通知服务**  | 统一处理站内信、邮件、短信、推送                       | 所有涉及通知的用例                                                  |
| **审批流程服务**  | 管理各类审批任务（试听、调课、排课需求等）                  | UC-TRIAL-01, UC-TRIAL-02, UC-CL-01, UC-SCHED-01, UC-OC-01  |
| **文件存储服务**  | 文件上传、下载、版本控制、DRM、预览                    | UC-MAT-01, UC-FEED-01, UC-VOD-01, UC-EXAM-01               |
| **权限服务**    | 管理角色、权限、数据访问控制                         | UC-INFO-01, UC-INFO-02, 所有需要权限校验的用例                        |
| **规则引擎服务**  | 管理可配置的业务规则（候补规则、调课次数、预警阈值等）            | 多用例需调用规则                                                   |

> 注：以上服务可根据实际部署情况合并（如报告服务可与统计服务合并），但核心原则是职责单一、独立演进。

---

## 二、重点服务详细分析

### 1. 用户服务 (User Service)

### 2. 课程服务 (Course Service)

#### 职责
管理课程的静态信息，包括课程基本信息、课时包、课程资料（讲义等）、容量及候补规则。不涉及具体上课时间、教师分配等动态内容。

#### 需求细节（来自用例）
- **课程基本信息**：课程名称、描述、科目、级别、类型（班课/一对一/录播）、状态（上架/下架）、所属校区（UC-WS-01, UC-WS-03）。
- **课时包**：一个课程可包含多个课时包（如10课时包、20课时包），包含课时数、价格、有效期（从报名起算）、退款规则（UC-WS-03）。
- **容量与候补规则**：课程总容量、是否允许候补、候补队列大小限制、补位确认时限（UC-WS-01）。
- **课程资料**：讲义、词汇表、PPT等，包含名称、类型、文件URL、版本、可见范围（仅学生/家长可见）、上传者（UC-MAT-01）。
- **课程模板**：用于快速创建课程，包含默认的课时包和资料（UC-SCHED-02, UC-PLAN-01）。

#### 领域模型

```java
// 课程
class Course {
    String courseId;
    String name;
    String description;
    String subject;
    String level;
    CourseType type; // GROUP, ONE_ON_ONE, RECORDED
    CourseStatus status; // DRAFT, PUBLISHED, ARCHIVED
    String campusId; // 可选
    int capacity; // 总容量
    boolean allowWaitlist;
    int waitlistSizeLimit; // 0表示无限制
    int confirmationTimeLimit; // 补位确认时限（小时）
    DateTime createdTime;
    DateTime modifiedTime;
}

// 课时包
class CoursePackage {
    String packageId;
    String courseId;
    String name; // 如“10课时包”
    int lessonCount;
    BigDecimal price;
    int validityPeriod; // 有效期天数
    String refundPolicy; // 退款规则描述
    PackageStatus status; // ACTIVE, INACTIVE
}

// 课程资料
class CourseMaterial {
    String materialId;
    String courseId;
    String name;
    MaterialType type; // HANDOUT, VOCAB, PPT, VIDEO, AUDIO
    String fileUrl; // 对象存储地址
    long fileSize;
    int version;
    Visibility visibility; // STUDENT_ONLY, PARENT_VISIBLE, PUBLIC
    String uploaderId;
    DateTime uploadTime;
    String description;
}

// 科目
class Subject {
    String subjectId;
    String name;
    String description;
}

// 级别
class Level {
    String levelId;
    String name;
}
```

#### 服务接口初步描述
- `createCourse(Course course)`：创建课程
- `updateCourse(String courseId, CourseUpdateDTO dto)`：更新课程
- `publishCourse(String courseId)` / `unpublishCourse(String courseId)`：发布/下架课程
- `listCourses(CourseFilter filter)`：查询课程列表（支持分页、过滤）
- `getCourse(String courseId)`：获取课程详情
- `addCoursePackage(String courseId, CoursePackage pkg)`：添加课时包
- `updateCoursePackage(String packageId, CoursePackageUpdateDTO dto)`：更新课时包
- `deleteCoursePackage(String packageId)`：删除课时包
- `uploadMaterial(String courseId, CourseMaterial material, MultipartFile file)`：上传资料
- `listMaterials(String courseId, MaterialFilter filter)`：获取课程资料列表
- `deleteMaterial(String materialId)`：删除资料
- `updateMaterialVisibility(String materialId, Visibility visibility)`：更新资料可见范围
- `getCourseCapacity(String courseId)`：获取课程容量与候补规则

---

### 3. 排课服务 (Scheduling Service)

#### 职责
管理课程的具体排期（班次），包括上课时间、教室、教师分配，处理排课需求、调课/取消、智能排课建议，维护教师日程和教室资源。

#### 需求细节（来自用例）
- **排课需求**：学导为学生创建，包含学生ID、目标科目、总课时、期望开始时间、上课频率、可接受时间窗、校区偏好、优先级等（UC-SCHED-01）。
- **班次**：一个课程的具体实例，有固定上课时间（如每周一19:00-21:00）、开始/结束日期、校区、教室、教师、容量、已选学生列表（UC-SCHED-02）。
- **教师日程**：教师可用时间块，避免冲突（UC-SCHED-02）。
- **教室资源**：教室的可用时间段（UC-SCHED-02）。
- **智能排课建议**：系统根据教师可用性、学生偏好、跨校区成本等生成多个方案（UC-SCHED-02）。
- **调课/取消申请**：学生发起，包含原班次、新时间偏好、原因，需审批（UC-CL-01）。
- **审批流程**：调课申请需教务审批（可与审批服务集成）。
- **候补补位触发**：当班次名额释放时，通知选课服务处理候补（UC-CL-01）。

#### 领域模型

```java
// 排课需求
class SchedulingRequest {
    String requestId;
    String studentId;
    String courseId; // 关联课程
    String targetSubject;
    int totalLessons;
    Date expectedStartDate;
    int frequency; // 每周次数
    List<TimeSlot> preferredTimeSlots; // 如周一19-21
    String preferredCampusId;
    String specialRequirements;
    Priority priority; // NORMAL, VIP
    RequestStatus status; // PENDING, PROCESSING, COMPLETED, REJECTED
    String createdBy; // 学导ID
    DateTime createdTime;
}

// 班次
class CourseSession {
    String sessionId;
    String courseId;
    String name; // 如“雅思6.5分班 周一晚班”
    Date startDate;
    Date endDate;
    List<WeeklyTimeSlot> schedule; // 每周上课时间
    String campusId;
    String classroomId;
    String teacherId;
    int capacity;
    List<String> enrolledStudentIds;
    SessionStatus status; // SCHEDULED, ONGOING, COMPLETED, CANCELLED
}

// 教师日程（可由排班模块生成）
class TeacherSchedule {
    String teacherId;
    TimeRange timeSlot;
    ScheduleStatus status; // AVAILABLE, BUSY, UNAVAILABLE
}

// 教室
class Classroom {
    String classroomId;
    String campusId;
    String name;
    int capacity;
    String facilities;
}

// 调课申请
class RescheduleRequest {
    String requestId;
    String studentId;
    String originalSessionId;
    List<TimeSlot> preferredNewTimeSlots;
    String reason;
    RequestStatus status; // PENDING, APPROVED, REJECTED, CANCELLED
    String approvedBy; // 教务ID
    DateTime approvedTime;
    String newSessionId; // 若重新安排
    DateTime createdTime;
}

// 时间段值对象
class TimeSlot {
    int dayOfWeek; // 1=周一, 7=周日
    LocalTime startTime;
    LocalTime endTime;
}

class WeeklyTimeSlot extends TimeSlot {
    // 继承
}
```

#### 服务接口初步描述
- `createSchedulingRequest(SchedulingRequest request)`：创建排课需求
- `getSchedulingRequest(String requestId)`：查询排课需求
- `processRequest(String requestId)`：教务处理需求（获取待处理列表）
- `generateSchedulingOptions(String requestId)`：生成智能排课建议（返回多个方案）
- `createSessionFromOption(String requestId, Option option)`：根据选定方案创建班次并 enroll 学生
- `createSessionManually(CourseSession session)`：手动创建班次
- `listSessions(SessionFilter filter)`：查询班次列表
- `getSession(String sessionId)`：获取班次详情（含学生名单）
- `createRescheduleRequest(RescheduleRequest request)`：学生申请调课
- `approveRescheduleRequest(String requestId, String newSessionId)`：审批通过调课
- `rejectRescheduleRequest(String requestId, String reason)`：拒绝调课
- `cancelRescheduleRequest(String requestId)`：学生主动取消申请
- `updateSession(String sessionId, SessionUpdateDTO dto)`：教务调整班次（检查冲突）
- `cancelSession(String sessionId, String reason)`：取消班次（需处理已选学生）
- `getTeacherAvailability(String teacherId, DateRange range)`：获取教师可用时间
- `getClassroomAvailability(String classroomId, DateRange range)`：获取教室可用时间
- `enrollStudent(String sessionId, String studentId)`：将学生加入班次
- `removeStudent(String sessionId, String studentId, String reason)`：从班次移除学生

---

### 4. 选课服务 (Enrollment Service)

#### 职责
管理学生对班次的选课、候补队列、名额释放、预约权限控制，确保并发安全，并与排课服务、通知服务交互。

#### 需求细节（来自用例）
- **选课/预约**：学生选择班次，若有空位直接占座，否则可加入候补队列（UC-WS-01）。
- **候补队列**：每个班次一个候补队列，先进先出；补位时通知队首学生，并在规定时间内确认（UC-WS-01）。
- **预约权限控制**：根据学生状态（如是否被处罚）判断是否允许预约（UC-WS-02）。
- **并发控制**：防止超卖（UC-WS-01）。
- **取消预约**：学生取消已预约班次，释放名额，触发候补补位（UC-WS-01）。
- **处罚规则**：当周取消或旷课达到次数，禁止下周预约（由出勤服务调用选课服务设置处罚）（UC-WS-02）。
- **课时消耗关联**：选课成功可能需检查课时余额（若课程需扣课时），但实际扣减由点名触发（UC-WS-03）。

#### 领域模型

```java
// 选课记录
class Enrollment {
    String enrollmentId;
    String studentId;
    String sessionId;
    EnrollmentStatus status; // ENROLLED, WAITLISTED, CANCELLED, COMPLETED, EXPIRED
    DateTime enrolledTime;
    Integer waitlistPosition; // 仅在候补中有效
    EnrollmentSource source; // DIRECT, WAITLIST_CONFIRMATION, MANUAL
    DateTime confirmedTime; // 补位确认时间
    DateTime expirationTime; // 补位确认截止时间
    DateTime cancelledTime;
    String cancelledReason;
}

// 候补队列条目
class WaitlistEntry {
    String waitlistId;
    String sessionId;
    String studentId;
    int position;
    DateTime joinTime;
    WaitlistStatus status; // WAITING, NOTIFIED, CONFIRMED, EXPIRED, CANCELLED
}

// 学生选课资格
class EnrollmentEligibility {
    String studentId;
    boolean eligible;
    String reason; // 如“本周已取消2次，禁止预约”
    Date nextAvailableDate; // 处罚解禁日期
}

// 选课规则（可配置）
class EnrollmentRule {
    String ruleId;
    String name;
    int maxCancellationsPerWeek;
    int penaltyDuration; // 处罚周数
    int waitlistConfirmationHours; // 补位确认时限（小时）
}
```

#### 服务接口初步描述
- `checkEligibility(String studentId, String sessionId)`：检查学生是否有资格预约该班次
- `enroll(String studentId, String sessionId)`：学生预约班次（若有空位直接占座，否则加入候补）
- `cancelEnrollment(String enrollmentId, String reason)`：取消预约（释放名额，触发候补处理）
- `joinWaitlist(String studentId, String sessionId)`：直接加入候补（不占座）
- `leaveWaitlist(String waitlistId)`：离开候补队列
- `processWaitlist(String sessionId)`：当名额释放时调用，通知队首学生
- `confirmWaitlist(String waitlistId)`：被补位学生确认，正式占座
- `expireWaitlistConfirmations()`：定时任务，处理超时未确认的候补
- `listEnrollments(String studentId, EnrollmentFilter filter)`：获取学生选课列表
- `getSessionEnrollments(String sessionId)`：获取班次选课情况（含候补列表）
- `setEnrollmentPenalty(String studentId, boolean penalty, Date nextAvailableDate)`：设置/解除处罚（由其他服务调用）
- `getWaitlistPosition(String studentId, String sessionId)`：获取学生在某班次候补中的位置

---

以上是对四个核心微服务的详细分析。其他服务的分析与设计可遵循类似模式，根据职责从用例中提取需求、构建领域模型、定义服务接口。这样的划分确保了各服务职责单一、独立部署、易于扩展，符合微服务架构的设计原则。