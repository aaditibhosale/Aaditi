const express = require("express");
const router = express.Router();
const db = require("../db");
const utils = require("../utils");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const config = require("../config");
const verifyToken = require("../verifyToken");

// show all students
router.get("/students-without-groups", (req, res) => {
    // Query to fetch list of students from database
   
    // const query = "SELECT roll_number,student_name,email FROM students where course_id is null and group_id is null";

    const query = "SELECT * FROM students where group_id is null";
  
    db.execute(query, (error, coordinates) => {
      if (error) {
        res.status(500).json(utils.createErrorResponse("Database error"));
      } else {
        res.json(utils.createSuccessResponse(students));
      }
    });
  });

  
  // students with groups for a student
router.put("/students-update/:id", verifyToken, (req, res) => {
    const { id } = req.params;
    const { group_id } = req.body;
  
    const query = "UPDATE students SET group_id = ? WHERE student_id = ?";
    db.execute(query, [group_id, id], (error, results) => {
      if (error) {
        res.status(500).json(utils.createErrorResponse("Database error"));
      } else {
        if (results.affectedRows === 0) {
          res.status(404).json(utils.createErrorResponse("Student not found"));
        } else {
          res.json(utils.createSuccessResponse({ id, group_id }));
        }
      }
    });
  });

  //we are do operation on group id but we want group name in the front end

  // Show all students with their group names
//group id == group name
router.get("/students-with-group-name/:group_name", (req, res) => {

  const { group_name } = req.params
  const query = "SELECT group_id FROM course_groups WHERE group_name=?";

  db.execute(query, [group_name], (error, groups) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {

      const group_id = groups[0].group_id
      console.log("group_id", group_id);

      const studentQuery = "select * from students where group_id = ?"

      db.execute(studentQuery, [group_id], (error, results) => {
          if (error) {
            res.status(500).json(utils.createErrorResponse("Database error"));
          } else {
            if (results.length === 0) {
              res.status(404).json(utils.createErrorResponse("Student is not found in the group"));
            } else {
              res.json(utils.createSuccessResponse({results} ));
            }
          }
        });
      }
    });
  });




//...add marks scheme section...



//show all mark scheme to subject
router.put("/students-add-marks-to-scheme", verifyToken, (req, res) => {
  const { subject_name, theory_weightage, lab_weightage, ia1_weightage, ia2_weightage } = req.body;

  // Check if the subject already exists
  const checkQuery = "SELECT * FROM evalution_scheme WHERE subject_name = ?";
  db.execute(checkQuery, [subject_name], (error, results) => {
      if (error) {
          res.status(500).json(utils.createErrorResponse("Database error"));
      } else {
          if (results.length > 0) {
              // Subject exists, update the record
              const updateQuery = `
                  UPDATE evalution_scheme
                  SET theory_weightage = ?, lab_weightage = ?, ia1_weightage = ?, ia2_weightage = ?
                  WHERE subject_name = ?
              `;
              db.execute(updateQuery, [theory_weightage, lab_weightage, ia1_weightage, ia2_weightage, subject_name], (error, results) => {
                  if (error) {
                      res.status(500).json(utils.createErrorResponse("Database error"));
                  } else {
                      res.json(utils.createSuccessResponse({ message: "Marks scheme updated successfully" }));
                  }
              });
          } else {
              // Subject does not exist, insert a new record
              const insertQuery = `
                  INSERT INTO evalution_scheme (subject_name, theory_weightage, lab_weightage, ia1_weightage, ia2_weightage)
                  VALUES (?, ?, ?, ?, ?)
              `;
              db.execute(insertQuery, [subject_name, theory_weightage, lab_weightage, ia1_weightage, ia2_weightage], (error, results) => {
                  if (error) {
                      res.status(500).json(utils.createErrorResponse("Database error"));
                  } else {
                      res.json(utils.createSuccessResponse({ message: "Marks scheme added successfully" }));
                  }
              });
          }
      }
  });
});



// Add or update marks scheme for a specific subject
router.put("/students-add-marks-to-subject/:subject_name", verifyToken, (req, res) => {
  const { subject_name } = req.params;
  const { theory_weightage, lab_weightage, ia1_weightage, ia2_weightage } = req.body;
  if (!theory_weightage || !lab_weightage || !ia1_weightage || !ia2_weightage) {
    return res.status(400).json(utils.createErrorResponse("All fields are required"));
  }
  const checkQuery = "SELECT * FROM evalution_scheme WHERE subject_name = ?";
  db.execute(checkQuery, [subject_name], (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      if (results.length > 0) {
        const updateQuery = `
          UPDATE evalution_scheme
          SET theory_weightage = ?, lab_weightage = ?, ia1_weightage = ?, ia2_weightage = ?
          WHERE subject_name = ?
        `;
        db.execute(updateQuery, [theory_weightage, lab_weightage, ia1_weightage, ia2_weightage, subject_name], (error, results) => {
          if (error) {
            res.status(500).json(utils.createErrorResponse("Database error"));
          } else {
            res.json(utils.createSuccessResponse({ message: "Marks scheme updated successfully" }));
          }
        });
      } else {
        const insertQuery = `
          INSERT INTO evalution_scheme (subject_name, theory_weightage, lab_weightage, ia1_weightage, ia2_weightage)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.execute(insertQuery, [subject_name, theory_weightage, lab_weightage, ia1_weightage, ia2_weightage], (error, results) => {
          if (error) {
            res.status(500).json(utils.createErrorResponse("Database error"));
          } else {
            res.json(utils.createSuccessResponse({ message: "Marks scheme added successfully" }));
          }
        });
      }
    }
  });
});



//...Add Evalution....section


//..> add evaluation
router.post("/evaluations/add", verifyToken, (req, res) => {
  const { subject_id, group_id, staff_id, type, start_date, till_date } = req.body;

  // Validate input
  if (!subject_id || !group_id || !staff_id || !type || !start_date || !till_date) {
    return res.status(400).json(utils.createErrorResponse("All fields are required"));
  }

  // Insert evaluation record
  const query = `
    INSERT INTO evaluations (subject_id, group_id, staff_id, type, start_date, till_date) 
    VALUES (?, ?, ?, ?, ?, ?)
  `; 
  // but type ,start and till date we are not created in database????


  db.execute(query, [subject_id, group_id, staff_id, type, start_date, till_date], (error, results) => {
    if (error) {
      return res.status(500).json(utils.createErrorResponse("Database error"));
    }

    res.json(utils.createSuccessResponse({ message: "Evaluation added successfully" }));
  });
});


// Fetch all subjects
router.get("/subjects", (req, res) => {
  const query = "SELECT * FROM subjects";
  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});

// Fetch all groups
router.get("/groups", (req, res) => {
  const query = "SELECT * FROM groups";
  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});

// Fetch all staff members
router.get("/staff", (req, res) => {
  const query = "SELECT * FROM staff";
  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error- ", error));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});





//-->Assign task

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


// Assign task
// router.post("/tasks/assign", verifyToken, async (req, res) => {
//   const { staff_name, student_name, group_name, subject_name, theory, lab, ia1, ia2, from_date, till_date, approved } = req.body;

//   // Validate input
//   if (!staff_name || !student_name || !group_name || !subject_name || !from_date || !till_date) {
//     return res.status(400).json(utils.createErrorResponse("Required fields are missing"));
//   }

//   try {
//     // Fetch IDs based on names
//     const staff_id = await getIdFromName('staff_members', 'staff_name', staff_name);
//     const student_id = await getIdFromName('students', 'student_name', student_name);
//     const group_id = await getIdFromName('groups', 'group_name', group_name);
//     const subject_id = await getIdFromName('subjects', 'subject_name', subject_name);

//     // Check if any ID is not found
//     if (!staff_id || !student_id || !group_id || !subject_id) {
//       return res.status(404).json(utils.createErrorResponse("One or more names not found"));
//     }

//     // Insert task record
//     const query = `
//       INSERT INTO tasks (staff_id, student_id, group_id, subject_id, theory, lab, ia1, ia2, from_date, till_date, approved)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.execute(query, [staff_id, student_id, group_id, subject_id, theory, lab, ia1, ia2, from_date, till_date, approved], (error, results) => {
//       if (error) {
//         return res.status(500).json(utils.createErrorResponse("Database error"));
//       }

//       res.json(utils.createSuccessResponse({ message: "Task assigned successfully" }));
//     });

//   } catch (error) {
//     res.status(500).json(utils.createErrorResponse("Error processing request"));
//   }
// });


// // Fetch all staff members
// router.get("/staff", (req, res) => {
//   const query = "SELECT * FROM staff_members";
//   db.execute(query, (error, results) => {
//     if (error) {
//       res.status(500).json(utils.createErrorResponse("Database error"));
//     } else {
//       res.json(utils.createSuccessResponse(results));
//     }
//   });
// });

// // Fetch all students
// router.get("/students", (req, res) => {
//   const query = "SELECT * FROM students";
//   db.execute(query, (error, results) => {
//     if (error) {
//       res.status(500).json(utils.createErrorResponse("Database error"));
//     } else {
//       res.json(utils.createSuccessResponse(results));
//     }
//   });
// });

// // Fetch all groups
// router.get("/groups", (req, res) => {
//   const query = "SELECT * FROM groups";
//   db.execute(query, (error, results) => {
//     if (error) {
//       res.status(500).json(utils.createErrorResponse("Database error"));
//     } else {
//       res.json(utils.createSuccessResponse(results));
//     }
//   });
// });

// // Fetch all subjects
// router.get("/subjects", (req, res) => {
//   const query = "SELECT * FROM subjects";
//   db.execute(query, (error, results) => {
//     if (error) {
//       res.status(500).json(utils.createErrorResponse("Database error"));
//     } else {
//       res.json(utils.createSuccessResponse(results));
//     }
//   });
// });



router.post(
  "/assign-task",
  (request, response) => {
    const {
      course_name,
      subject_name,
      group_name,
      staff_name,
      from_date,
      till_date,
    } = request.body;

    console.log("/assign-task req.body ", request.body);

    // Check if the course exists
    const courseQuery = `SELECT course_id FROM courses WHERE course_name = ?`;
    db.execute(courseQuery, [course_name], (courseError, courseResult) => {
      if (courseError) {
        response
          .status(500)
          .send(utils.createErrorResponse(courseError.message));
        return;
      }

      if (courseResult.length === 0) {
        response
          .status(404)
          .send(utils.createErrorResponse("Course not found"));
        return;
      }

      const course_id = courseResult[0].course_id;
      console.log("courseId ", course_id);

      // Check if the subject exists
      const subjectQuery = `SELECT subject_id FROM subjects WHERE subject_name = ?`;
      db.execute(
        subjectQuery,
        [subject_name],
        (subjectError, subjectResult) => {
          if (subjectError) {
            response
              .status(500)
              .send(utils.createErrorResponse(subjectError.message));
            return;
          }

          if (subjectResult.length === 0) {
            response
              .status(404)
              .send(utils.createErrorResponse("Subject not found"));
            return;
          }

          const subject_id = subjectResult[0].subject_id;
          console.log("subId", subject_id);

          // Check if the group exists
          const groupQuery = `SELECT group_id FROM course_groups WHERE group_name = ?`;
          db.execute(groupQuery, [group_name], (groupError, groupResult) => {
            if (groupError) {
              response
                .status(500)
                .send(utils.createErrorResponse(groupError.message));
              return;
            }

            if (groupResult.length === 0) {
              response
                .status(404)
                .send(utils.createErrorResponse("Group not found"));
              return;
            }

            const group_id = groupResult[0].group_id;
            console.log("groupId", group_id);

            // Check if the staff exists
            const staffQuery = `SELECT staff_id FROM staff WHERE staff_name = ?`;
            db.execute(staffQuery, [staff_name], (staffError, staffResult) => {
              if (staffError) {
                response
                  .status(500)
                  .send(utils.createErrorResponse(staffError.message));
                return;
              }

              if (staffResult.length === 0) {
                response
                  .status(404)
                  .send(utils.createErrorResponse("Staff not found"));
                return;
              }

              const staff_id = staffResult[0].staff_id;
              console.log("staffId", staff_id);

              // Fetch all student IDs belonging to the group
              const studentQuery = `SELECT student_id FROM students WHERE group_id = ?`;
              console.log("studentQuery", studentQuery);

              db.execute(
                studentQuery,
                [group_id],
                (studentError, studentResult) => {
                  if (studentError) {
                    response
                      .status(500)
                      .send(utils.createErrorResponse(studentError.message));
                    return;
                  }

                  // Check if any students were found in the group
                  if (studentResult.length === 0) {
                    response
                      .status(404)
                      .send(
                        utils.createErrorResponse(
                          "No students found in the group"
                        )
                      );
                    return;
                  }

                  // Extract student IDs from the result
                  console.log("studentResult ", studentResult);

                  const studentIds = studentResult.map(
                    (student) => student.student_id
                  );
                  // console.log("studentIds ", student.student_id);

                  // Insert data into MarksEntry table for each student
                  const insertQuery = `INSERT INTO mark_entry
                    (student_id, subject_id, group_id, course_id, staff_id)
                    VALUES (?, ?, ?, ?, ?)`;

                  // Create an array of arrays containing values for each student
                  const values = studentIds.map((studentId) => [
                    studentId,
                    subject_id,
                    group_id,
                    course_id,
                    staff_id,
                  ]);

                  console.log("insertQuery ", insertQuery);

                  // Execute the insert query for each set of values
                  values.forEach((valueSet, index) => {
                    db.execute(
                      insertQuery,
                      valueSet,
                      (insertError, insertResult) => {
                        if (insertError) {
                          console.error(
                            `Error inserting data for student ${studentIds[index]}: ${insertError.message}`
                          );
                        } else {
                          console.log(
                            `Data inserted successfully for student ${studentIds[index]}`
                          );
                        }
                      }
                    );
                  });

                  // Send success response
                  response.send(
                    utils.createSuccessResponse(
                      "Task assigned successfully for all students in the group"
                    )
                  );
                }
              );
            });
          });
        }
      );
    });
  }
);



//completed Task

//get
// Fetch all completed tasks
router.get("/tasks/completed", (req, res) => {
  const query = `
    SELECT 
      t.id, 
      s.staff_name, 
      st.student_name, 
      g.group_name, 
      sb.subject_name, 
      t.theory, 
      t.lab, 
      t.ia1, 
      t.ia2, 
      t.from_date, 
      t.till_date, 
      t.approved 
    FROM tasks t
    JOIN staff_members s ON t.staff_id = s.id
    JOIN students st ON t.student_id = st.id
    JOIN groups g ON t.group_id = g.id
    JOIN subjects sb ON t.subject_id = sb.id
    WHERE t.completed = true`; // Assuming 'completed' is a boolean field

  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});

//post

router.post("/tasks/assign", verifyToken, async (req, res) => {
  const { staff_name, student_name, group_name, subject_name, theory, lab, ia1, ia2, from_date, till_date, approved } = req.body;

  // Validate input
  if (!staff_name || !student_name || !group_name || !subject_name || !from_date || !till_date) {
    return res.status(400).json(utils.createErrorResponse("Required fields are missing"));
  }

  try {
    // Fetch IDs based on names
    const staff_id = await getIdFromName('staff_members', 'staff_name', staff_name);
    const student_id = await getIdFromName('students', 'student_name', student_name);
    const group_id = await getIdFromName('groups', 'group_name', group_name);
    const subject_id = await getIdFromName('subjects', 'subject_name', subject_name);

    // Check if any ID is not found
    if (!staff_id || !student_id || !group_id || !subject_id) {
      return res.status(404).json(utils.createErrorResponse("One or more names not found"));
    }

    // Insert task record
    const query = `
      INSERT INTO tasks (staff_id, student_id, group_id, subject_id, theory, lab, ia1, ia2, from_date, till_date, approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.execute(query, [staff_id, student_id, group_id, subject_id, theory, lab, ia1, ia2, from_date, till_date, approved], (error, results) => {
      if (error) {
        return res.status(500).json(utils.createErrorResponse("Database error"));
      }

      res.json(utils.createSuccessResponse({ message: "Task assigned successfully" }));
    });

  } catch (error) {
    res.status(500).json(utils.createErrorResponse("Error processing request"));
  }
});

// Fetch all staff members
router.get("/staff", (req, res) => {
  const query = "SELECT * FROM staff_members";
  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});

// Fetch all students
router.get("/students", (req, res) => {
  const query = "SELECT * FROM students";
  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});

// Fetch all groups
router.get("/groups", (req, res) => {
  const query = "SELECT * FROM groups";
  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});

// Fetch all subjects
router.get("/subjects", (req, res) => {
  const query = "SELECT * FROM subjects";
  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});

// Fetch all completed tasks
router.get("/tasks/completed", (req, res) => {
  const query = `
    SELECT 
      t.id, 
      s.staff_name, 
      st.student_name, 
      g.group_name, 
      sb.subject_name, 
      t.theory, 
      t.lab, 
      t.ia1, 
      t.ia2, 
      t.from_date, 
      t.till_date, 
      t.approved 
    FROM tasks t
    JOIN staff_members s ON t.staff_id = s.id
    JOIN students st ON t.student_id = st.id
    JOIN groups g ON t.group_id = g.id
    JOIN subjects sb ON t.subject_id = sb.id
    WHERE t.completed = true`; // Assuming 'completed' is a boolean field

  db.execute(query, (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(results));
    }
  });
});

module.exports = router;
//end























