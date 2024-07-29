CREATE DATABASE Ass;
USE Ass;

CREATE TABLE students(
student_id int PRIMARY KEY,
first_name varchar(50),
last_name varchar(50),
email varchar(100),
birthdate DATE,
gender enum('Male','Female'),
enrollment_date date
);

CREATE TABLE Courses(
course_id int PRIMARY KEY,
course_name varchar(100),
course_description text,
start_date DATE,
end_data DATE
);

CREATE TABLE Enrollments(
enrollment_id int PRIMARY KEY,
student_id int,
course_id int
);

INSERT INTO students VALUES(1,'Aarav','sharma','aarav.sharma@exmple.com','2003-01-15','Male','2024-01-01');
INSERT INTO students VALUES(2,'Aditi','Mehta','aditi.mehta@exmple.com','2002-05-22','Female','2024-01-01');
INSERT INTO students VALUES(3,'Ishaan','singh','ishaan.singh@exmple.com','2004-02-14','Male','2024-01-01');
INSERT INTO students VALUES(4,'Riya','Patel','riya.patel@exmple.com','2001-11-30','Female','2024-01-01');
INSERT INTO students VALUES(5,'Kavya','Reddy','kavya.reddy@exmple.com','2003-07-07','Female','2024-01-01');
INSERT INTO students VALUES(6,'Vivaan','Nair','vivaan.nair@exmple.com','2002-03-20','Male','2024-01-01');
INSERT INTO students VALUES(7,'Ananya','Ghosh','ananya.ghosh@exmple.com','2004-05-25','Female','2024-01-01');
INSERT INTO students VALUES(8,'Arjun','Kumar','arjun.kumar@exmple.com','2003-10-10','Male','2024-01-01');
INSERT INTO students VALUES(9,'Saanvi','Joshi','saanvi.joshi@exmple.com','2004-08-18','Female','2024-01-01');
INSERT INTO students VALUES(10,'Dev','Bose','dev.bose@exmple.com','2001-12-12','Male','2024-01-01');

-- SELECT * FROM students-- ;

INSERT INTO Courses VALUES(1,'Database Systems','introduction to database systems and SQL','2024-02-01','2024-05-01');
INSERT INTO Courses VALUES(2,'Web development','learn html,css,javascript,and basic web development tech','2024-02-01','2024-05-01');
INSERT INTO Courses VALUES(3,'Data structure','learn about various data structure and their application','2024-02-01','2024-05-01');
INSERT INTO Courses VALUES(4,'Algorithms','introduction to algorithms and problem solving tech','2024-02-01','2024-05-01');
INSERT INTO Courses VALUES(5,'Computer networks','overview of computer networking principal','2024-02-01','2024-05-01');

-- SELECT * FROM Courses;

INSERT INTO Enrollments VALUES(1,1,1),(2,1,2),(3,2,1),(4,2,3),(5,3,2),(6,3,4),(7,4,3),(8,4,5),(9,5,4),(10,5,1),(11,6,5),(12,6,2),(13,7,1),(14,8,3),(15,9,4),(16,10,5);

 SELECT * FROM Enrollments;

-- SELECT s.student_id, s.first_name, s.last_name, c.course_id, c.course_name 
-- FROM Students s 
-- LEFT JOIN enrollments e ON s.student_id = e.student_id;

SELECT s.student_id, s.first_name, s.last_name, c.course_id, c.course_name 
FROM Students s , courses c, enrollments e where s.student_id = e.student_id and c.course_id = e.course_id;




SELECT s.student_id, s.first_name, COUNT(e.course_id) AS course_count
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id
GROUP BY s.student_id, s.first_name;


SELECT c.course_id, c.course_name, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name;


-- SELECT s.first_name,s.last_name 
-- FROM students s
-- JOIN enrollments e1 ON s.student_id = e1.student_id
-- JOIN enrollments e2 ON s.student_id = e2.student_id
-- JOIN courses c1 ON e1.course_id = c1.course_id
-- JOIN courses c2 ON e2.course_id = c2.course_id
-- WHERE c1.course_name = 'Database Systems'
--   AND c2.course_name = 'Web Development';

SELECT s.first_name, c.course_name 
FROM Students s , courses c, enrollments e
 where s.student_id = e.student_id and c.course_id = e.course_id
  WHERE c1.course_name = 'Database Systems'
   AND c2.course_name = 'Web Development';

SELECT s.first_name, s.last_name, s.email
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
GROUP BY  s.first_name, s.last_name, s.email
HAVING COUNT(e.course_id) = 2;

































