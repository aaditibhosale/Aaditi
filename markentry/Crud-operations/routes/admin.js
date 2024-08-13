const express = require("express");
const router = express.Router();
const db = require("../db");
const utils = require("../utils");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const config = require("../config");
const verifyToken = require("../verifyToken");

// show all students
router.get("/students-without-course", (req, res) => {
    // Query to fetch list of students from database
   
    // const query = "SELECT roll_number,student_name,email FROM students where course_id is null and group_id is null";

    const query = "SELECT * FROM students where course_id is null and group_id is null";
  
    db.execute(query, (error, coordinates) => {
      if (error) {
        res.status(500).json(utils.createErrorResponse("Database error"));
      } else {
        res.json(utils.createSuccessResponse(coordinates));
      }
    });
  });

  // Update course_id for a student
router.put("/students-update/:id", (req, res) => {
    const { id } = req.params;
    const { course_id } = req.body;
  
    const query = "UPDATE students SET course_id = ? WHERE student_id = ?"; //where the course id is NULL
    db.execute(query, [course_id, id], (error, results) => {
      if (error) {
        console.log(error);
        
        res.status(500).json(utils.createErrorResponse("Database error"));
      } else {
        if (results.affectedRows === 0) {
          res.status(404).json(utils.createErrorResponse("Student not found"));
        } else {
          res.json(utils.createSuccessResponse({ id, course_id }));
        }
      }
    });
  });



// Show all students with their course names
//course id == course name
router.get("/students-with-course-name/:course_name", (req, res) => {

    const { course_name } = req.params
    const query = "SELECT course_id FROM courses WHERE course_name=?";
  
    db.execute(query, [course_name], (error, courses) => {
      if (error) {
        res.status(500).json(utils.createErrorResponse("Database error"));
      } else {

        const course_id = courses[0].course_id
        console.log("course_id", course_id);

        const studentQuery = "select * from students where course_id = ?"

        db.execute(studentQuery, [course_id], (error, results) => {
            if (error) {
              res.status(500).json(utils.createErrorResponse("Database error"));
            } else {
              if (results.length === 0) {
                res.status(404).json(utils.createErrorResponse("Student not found"));
              } else {
                res.json(utils.createSuccessResponse({results} ));
              }
            }
          });
      }
    });
  });



// ..>> api for staff


// show all staff

router.get("/staff", (req, res) => {
    // Query to fetch list of students from database
   
    // const query = "SELECT roll_number,student_name,email FROM students where course_id is null and group_id is null";

    const query = "SELECT * FROM staff";
  
    db.execute(query, (error, coordinates) => {
      if (error) {
        res.status(500).json(utils.createErrorResponse("Database error"));
      } else {
        res.json(utils.createSuccessResponse(coordinates));
      }
    });
  });


//update staff

// Helper function to get IDs from names
const getIdFromName = (table, nameColumn, name) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id FROM ${table} WHERE ${nameColumn} = ?`;
    db.execute(query, [name], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        resolve(null);
      } else {
        resolve(results[0].id);
      }
    });
  });
};

// Update staff details
router.put("/staff/update", (req, res) => {
  // const { id } = req.params;
  const { email, course, role } = req.body;
  console.log("update ",req.body);
  

  // Validate input
  // if (!email) {
  //   return res.status(400).json(utils.createErrorResponse("Email address is required"));
  // }

  
    // Fetch IDs based on names
    // const course_id = course_name ? await getIdFromName('courses', 'course_name', course_name) : null;
    // const role_id = role_name ? await getIdFromName('roles', 'role_name', role_name) : null;

    // Prepare the update query and parameters
    // let updateQuery = `UPDATE staff_members SET email = ?`;
    // let queryParams = [email];

    // if (course_id) {
    //   updateQuery += `, course_id = ?`;
    //   queryParams.push(course_id);
    // }
    // if (role_id) {
    //   updateQuery += `, role_id = ?`;
    //   queryParams.push(role_id);
    // }

    // updateQuery += ` WHERE staff_id = ?`;
    // queryParams.push(id);

    const updateQuery = "update staff set course_name = ?, role = ? where email = ?"

    // Execute the update query
    db.execute(updateQuery, [course, role, email], (error, results) => {
      if (error) {
        console.log("error", error)
        return res.status(500).json(utils.createErrorResponse("Database error"));
      }

      if (results.affectedRows === 0) {
        return res.status(404).json(utils.createErrorResponse("Staff member not found"));
      }

      res.json(utils.createSuccessResponse({ message: "Staff details updated successfully" }));
    });


});



//-->> show all courses

//get (show courses)
router.get("/students-all-courses", (req, res) => {
  // Query to fetch list of students from database
  console.log("students");
  const query = "SELECT * FROM courses";

  db.execute(query, (error, students) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(students));
    }
  });
});

//post

router.post("/create-course", (req, res) => {
  const { courseName, courseDescription } = req.body;
  const query = "INSERT INTO courses (course_name, description) VALUES (?, ?)";

  db.execute(query, [courseName, courseDescription], (error, result) => {
    if (error) {
      console.log(error);
      
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse({ id: result.insertId, courseName, courseDescription }));
    }
  });
});

//put
router.put("/update-course/:id", (req, res) => {
  const { id } = req.params;
  const { courseName, courseDescription } = req.body;
  const query = "UPDATE courses SET name = ?, description = ? WHERE id = ?";

  db.execute(query, [courseName, courseDescription, id], (error, result) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else if (result.affectedRows === 0) {
      res.status(404).json(utils.createErrorResponse("Course not found"));
    } else {
      res.json(utils.createSuccessResponse({ id, courseName, courseDescription }));
    }
  });
});

 
//delete

router.delete("/delete-course/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM courses WHERE id = ?";

  db.execute(query, [id], (error, result) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else if (result.affectedRows === 0) {
      res.status(404).json(utils.createErrorResponse("Course not found"));
    } else {
      res.json(utils.createSuccessResponse({ id }));
    }
  });
});



//-->> subject

// // GET /show-subjects
// router.get("/courses/:courseId/subjects-show", (req, res) => {
//   const { courseId } = req.params;
//   const query = "SELECT * FROM subjects WHERE course_id = ?";

//   db.execute(query, [courseId], (error, subjects) => {
//     if (error) {
//       res.status(500).json(utils.createErrorResponse("Database error"));
//     } else {
//       res.json(utils.createSuccessResponse(subjects));
//     }
//   });
// });

router.get("/subject-with-course-name/:course_name", (req, res) => {

  const { course_name } = req.params
  const query = "SELECT course_id FROM courses WHERE course_name=?";

  db.execute(query, [course_name], (error, courses) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {

      const course_id = courses[0].course_id
      console.log("course_id", course_id);

      const studentQuery = "select * from subjects where course_id = ?"

      db.execute(studentQuery, [course_id], (error, results) => {
          if (error) {
            res.status(500).json(utils.createErrorResponse("Database error"));
          } else {
            if (results.length === 0) {
              res.status(404).json(utils.createErrorResponse("Subject not found"));
            } else {
              res.json(utils.createSuccessResponse({results} ));
            }
          }
        });
    }
  });
});





//post
router.post("/courses/:course_name/subjects-add/:subjectName", (req, res) => {
  const { course_name, subjectName } = req.params;
  const {  } = req.body;

  console.log( course_name, subjectName );
  const query = "SELECT course_id FROM courses WHERE course_name=?";

  db.execute(query, [course_name], (error, courses) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {

      const course_id = courses[0].course_id
      console.log("course_id", course_id);
  
  const query = "INSERT INTO subjects (subject_name, course_id) VALUES ( ?, ?)";

  db.execute(query, [subjectName, course_id], (error, result) => {
    if (error) {
      console.log(error)
      res.status(500).json(utils.createErrorResponse("Database error", error.message));
    } else {
      res.json(utils.createSuccessResponse({ id: result.insertId, subjectName, course_id }));
    }
  });
}})
});
 

//put

router.put("/courses/:courseId/subjects-update/:subjectId", (req, res) => {
  const { courseId, subjectId } = req.params;
  const { subjectName } = req.body;
  const query = "UPDATE subjects SET subject_name = ? WHERE subject_id = ? ";

  db.execute(query, [subjectName, subjectDescription, subjectId, courseId], (error, result) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else if (result.affectedRows === 0) {
      res.status(404).json(utils.createErrorResponse("Subject not found"));
    } else {
      res.json(utils.createSuccessResponse({ id: subjectId, subjectName, subjectDescription, courseId }));
    }
  });
});


//delete
router.delete("/courses/:courseId/subjects-delete/:subjectId", (req, res) => {
  const { courseId, subjectId } = req.params;
  const query = "DELETE FROM subjects WHERE id = ? AND course_id = ?";

  db.execute(query, [subjectId, courseId], (error, result) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else if (result.affectedRows === 0) {
      res.status(404).json(utils.createErrorResponse("Subject not found"));
    } else {
      res.json(utils.createSuccessResponse({ id: subjectId }));
    }
  });
});



//...>> course group

//get

// GET /show-subjects
router.get("/courses/:courseId/subjects-show", (req, res) => {
  const { courseId } = req.params;
  const query = "SELECT * FROM subjects WHERE course_id = ?";

  db.execute(query, [courseId], (error, subjects) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(subjects));
    }
  });
});
router.get("/courses/:courseId/subjects-show", (req, res) => {
  const { courseId } = req.params;
  const query = "SELECT * FROM subjects WHERE course_id = ?";

  db.execute(query, [courseId], (error, subjects) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(subjects));
    }
  });
});

router.get("/courses/:courseIdentifier/groups-show", (req, res) => {
  const { courseIdentifier } = req.params;
  let query = "";
  let params = [];

  if (isNaN(courseIdentifier)) {
    // courseIdentifier is a course name
    query = "SELECT * FROM course_groups WHERE course_name = ?";
    params = [courseIdentifier];
  } else {
    // courseIdentifier is a course ID
    query = "SELECT * FROM course_groups WHERE course_id = ?";
    params = [courseIdentifier];
  }

  db.execute(query, params, (error, groups) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(groups));
    }
  });
});


//POST
router.post("/courses/:courseId/groups-add", (req, res) => {
  const { courseId } = req.params;
  const { groupName } = req.body;
  const query = "INSERT INTO course_groups (group_name, course_id) VALUES (?, ?)";

  db.execute(query, [groupName, courseId], (error, result) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse({ id: result.insertId, groupName, courseId }));
    }
  });
});
 
//PUT
router.put("/courses/:courseId/groups-update/:groupId", (req, res) => {
  const { courseId, groupId } = req.params;
  const { groupName } = req.body;
  const query = "UPDATE course_groups SET group_name = ? AND course_id = ? WHERE group_id = ? ";

  db.execute(query, [groupName,courseId, groupId], (error, result) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else if (result.affectedRows === 0) {
      res.status(404).json(utils.createErrorResponse("Group not found"));
    } else {
      res.json(utils.createSuccessResponse({ id: groupId, groupName, courseId }));
    }
  });
});

//DELETE
router.delete("/courses/:courseId/groups-delete/:groupId", (req, res) => {
  const { courseId, groupId } = req.params;
  const query = "DELETE FROM course_groups WHERE group_id = ? AND course_id = ?";

  db.execute(query, [groupId, courseId], (error, result) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else if (result.affectedRows === 0) {
      res.status(404).json(utils.createErrorResponse("Group not found"));
    } else {
      res.json(utils.createSuccessResponse({ id: groupId }));
    }
  });
});

module.exports = router;
//end
