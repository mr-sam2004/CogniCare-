# User Guide — CogniCare+

> How to use CogniCare+ for each role.

---

## 1. Admin

### Login
- Go to `http://localhost:5173`
- Login with admin credentials

### Dashboard
After login, you see:
- **Dashboard tab**: Total users, pending parents, doctors, children counts
- **Parents tab**: All registered parents, their status
- **Doctors tab**: All registered doctors, create new doctors
- **Children tab**: All children, assign doctors, manage credentials
- **Leaderboard tab**: Global child leaderboard (sorted by score)
- **Feedback tab**: Parent feedback (ratings + comments)

### Manage Parents
1. Go to "Pending Parents" tab
2. Click "Approve" or "Reject" for each pending registration
3. Approved parents can login immediately

### Create Doctor
1. Go to "Doctors" tab
2. Click "Create Doctor"
3. Fill in: name, email, password, specialization, phone
4. Doctor can now login at `/login`

### Create Child
1. Go to "Children" tab
2. Click "Create Child"
3. Fill in: name, date of birth, diagnosis, parent, assign a doctor
4. Child can now login with credentials shown in Children tab

### View Parent Feedback
1. Go to "Feedback" tab
2. See all feedback submitted by parents
3. Each shows: parent name, star rating, comment, date

### Global Leaderboard
1. Go to "Leaderboard" tab
2. See all children ranked by total score
3. Performance chart shows growth over time

---

## 2. Doctor

### Login
Login with doctor credentials at `/login`

### Dashboard Tabs

#### Patients (Children)
- View all assigned children
- See each child's level, streak, score

#### Assignments
- View all therapy module assignments
- Click "Assign Module" to create new assignment
- Select child, module, difficulty level, due date
- Children see assigned tasks in their dashboard

#### Sessions
- View all scheduled sessions
- Click "Schedule Session"
- Select child, session type (VIDEO/IN_PERSON/VR), date, time, duration
- Add Google Meet link if needed
- Sessions appear in child's dashboard

#### Prescriptions
- View all prescriptions
- Click "Create Prescription"
- Select child, title, description, dosage, frequency
- Set start and end dates
- Children can download as PDF

#### VR Videos
- View all assigned VR videos
- Click "Assign Video"
- Select child, enter video title, YouTube URL, description, duration
- Children watch in their VR Sessions section
- Green "Watched" badge shows completed videos

#### Reports
- Click "Send Report"
- Select child, write title and report content
- Set star rating (1-5)
- Report appears in parent's Reports tab

#### Leaderboard
- View global child leaderboard
- Click on a child to see their performance chart

---

## 3. Parent

### Login
Login with parent credentials at `/login`

### Dashboard Tabs

#### Overview
- **Stats cards**: Day streak, total points, level, tasks done
- **Performance chart**: Line chart showing growth over time
- **Task progress**: Doughnut chart showing completion percentage
- **Upcoming sessions**: List of next sessions
- **Rewards earned**: Badges and rewards
- **Child login details**: Click "Show Login" to see child's credentials

#### Activity
- **Today's tasks**: Number completed, remaining
- **Points earned today**: Score from today's tasks
- **Sessions today**: Scheduled sessions for today
- **Activity feed**: Timeline of today's activities with timestamps
- **Overall stats**: Current streak, total score, level

#### Reports (Doctor Reports)
- **Unread reports**: Shown with blue border and red dot + "NEW" badge
- Click a report to expand and read it
- Report auto-marks as "Read" when expanded
- Star rating displayed for each report

### Submit Feedback to Admin
1. Click "💬 Feedback" button in the top nav
2. Rate service (1-5 stars)
3. Write your feedback/suggestions
4. Click "Submit to Admin"
5. Admin sees your feedback in their Feedback tab

### View Child Credentials
1. Go to Overview tab
2. Scroll to "Child Login Details" section
3. Click "Show Login" to see username and password

---

## 4. Child

### Login
Login with child credentials at `/login`

### Dashboard

#### Tasks & Games
- View assigned therapy modules
- Click a task to start the game
- Games include: Memory Match, Color Sorting, Number Sequence, Shape Recognition, Breathing Exercise, Story Completion, Focus Timer, Emotion Match
- Earn points based on performance and difficulty

#### Today's Progress
- Tasks completed today
- Current score
- Day streak

#### Leaderboard
- See your rank among all children
- Compare scores and levels

#### Rewards
- Badges earned for completing tasks
- Different badges for different achievements

### VR Sessions
1. Click "VR Sessions" in the sidebar
2. See videos assigned by your doctor
3. Click a video to watch (embedded YouTube player)
4. Click "Mark as Watched" after watching
5. Video moves to watched section

### Prescriptions
1. View prescriptions in the sidebar
2. See: medicine name, dosage, frequency, duration
3. Click "Print / Save PDF" to download
4. Opens a medical prescription format with:
   - Hospital header
   - Patient details
   - Medicine information
   - Doctor signature area
5. Auto-opens print dialog (save as PDF)

### Sessions
1. See upcoming sessions in sidebar
2. Click "Join" to join Google Meet session
3. After attending, click "Attended" button
4. Session auto-removes from your list

---

## Common Issues

### Can't login
- Check if account is approved (for parents)
- Verify credentials are correct
- Check backend is running

### No data showing
- Refresh the page
- Check backend connection (F12 → Network tab)
- Ensure database has data

### Feedback not submitting
- Ensure backend is restarted after any code changes
- Check browser console for errors
- Verify DB constraint allows the feedback type

---

## URL Routes

| Page | URL |
|------|-----|
| Login | `/login` |
| Parent Signup | `/signup` |
| Admin Dashboard | `/admin` |
| Doctor Dashboard | `/doctor` |
| Parent Dashboard | `/parent` |
| Child Dashboard | `/child` |
| Landing Page | `/` |
