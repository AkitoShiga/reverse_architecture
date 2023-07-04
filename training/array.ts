const numbers = [
  0,
  10,
  20,
  30,
  40,
  50,
  60,
  70,
  80,
  90,
]

numbers.forEach(
(num, i) => {
    const double = num * 2
    console.log(`${i}: ${double}`)
  }
)

const names = ['Alice', 'Bob', 'Carol']
const users = names.map((name, i) => {
  return {
    id: i,
    name: name
  }
})
console.log(users)
