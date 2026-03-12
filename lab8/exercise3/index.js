// Exercise 3: ES6 Classes and Promises - Course Enrollment System

// Define Course class
class Course {
    constructor(courseName, instructor) {
        this.courseName = courseName;
        this.instructor = instructor;
    }
    
    displayCourse() {
        console.log(`Course: ${this.courseName}, Instructor: ${this.instructor}`);
    }
}

// Create course instance
let course1 = new Course("Web Technologies", "Dr. Kumar");
course1.displayCourse();

// Promise to check enrollment availability
let enrollCourse = new Promise((resolve, reject) => {
    let seatsAvailable = true;
    if(seatsAvailable)
        resolve("Enrollment Successful");
    else
        reject("Course Full");
});

// Handle promise
enrollCourse
    .then(msg => console.log(msg))
    .catch(err => console.log(err));
