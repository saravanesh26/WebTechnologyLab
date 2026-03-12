// Exercise 1: Calculate total and average marks using ES6 features

let studentName = "Arun";
let mark1 = 85;
let mark2 = 90;
let mark3 = 88;

// Calculate total marks
const total = mark1 + mark2 + mark3;

// Arrow function to compute average
const calculateAverage = (m1, m2, m3) => {
    return (m1 + m2 + m3) / 3;
}

let average = calculateAverage(mark1, mark2, mark3);

// Display results using template literals
console.log(`Student Name: ${studentName}`);
console.log(`Total Marks: ${total}`);
console.log(`Average Marks: ${average.toFixed(2)}`);
