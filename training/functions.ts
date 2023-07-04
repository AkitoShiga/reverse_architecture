function mul1(v1: number, v2:number): number {
    return v1 * v2
}

const reuslt1 = mul1(1, 2)
console.log(reuslt1)

function mul2(v1: number, v2: number) {
    return v1 * v2
}

const result2_1 = mul2(10, 20)
console.log(result2_1)

//const result2_2 = mul2('hello', 'world')
//console.log(result_2_2)

function mul3(v1: any, v2: any): any {
  return v1 * v2
}

const result3_3 = mul3('hello', 'world')
console.log(result3_3)
