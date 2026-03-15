#### 职责
管理所有用户的基本信息、账户状态、角色、联系方式及关联关系（如学生-家长、学生-学导）。为其他服务提供用户数据查询和权限校验基础。

#### 需求细节（来自用例）
- **学生信息**：姓名、学号、联系方式、家长联系方式、紧急联系人、年级、学校、目标分、预计考试时间、VIP等级、负责学导/顾问、所属校区（UC-INFO-01, UC-CLASS-01, UC-OC-01）。
- **家长信息**：姓名、联系方式、关联学生（UC-INFO-01）。
- **教师信息**：姓名、工号、联系方式、所属校区、授课科目、资质（UC-INFO-02）。
- **教务/学导/顾问信息**：姓名、工号、联系方式、角色、管理范围（校区/学生）（UC-INFO-01, UC-INFO-02）。
- **账户状态**：正常、禁用、结课延续期（UC-POST-02）。
- **角色与权限**：权限由权限服务管理，用户服务维护角色分配。
- **关联关系**：学生-家长（一对多）、学生-学导/顾问（一对一）、教师-校区。
- **访问审计**：对敏感信息（如联系方式）的查询需记录日志（UC-INFO-01, UC-INFO-02）。

#### 服务接口初步描述
- `createUser(User user)`：创建用户（区分类型）
- `updateUser(String userId, UserUpdateDTO dto)`：更新用户信息
- `getUser(String userId)`：获取用户基本信息
- `getContactInfo(String userId, String requesterId)`：获取联系方式（需权限校验，记录日志）
- `searchUsers(UserSearchCriteria criteria, String requesterId)`：按条件搜索用户（返回权限内数据）
- `assignRole(String userId, String roleId)`：分配角色
- `setUserStatus(String userId, UserStatus status)`：设置用户状态
- `linkParentStudent(String parentId, String studentId)`：关联家长与学生
- `getResponsibleStaff(String studentId, StaffRole role)`：获取负责学导/顾问
- `logAccess(AccessLog log)`：记录访问日志