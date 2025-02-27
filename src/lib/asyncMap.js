const asyncMap = async (arr, fn) => await Promise.all(arr.map(fn))

export default asyncMap