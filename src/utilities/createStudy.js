const createStudy = (stance, ...config) => {
    // console.log('创建了指标')
    stance.chart().createStudy(...config)
}

export {
    createStudy
}