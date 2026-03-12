// Exercise 2: Object Destructuring and Spread Operator

// Define student object
const student = {
    id: 101,
    name: "Priya",
    department: "CSE",
    marks: 92
};

// Use object destructuring to extract values
const {id, name, department, marks} = student;
console.log(id, name, department, marks);

// Create new object using spread operator with additional grade property
const updatedStudent = {
    ...student,
    grade: "A"
};

console.log(updatedStudent);
