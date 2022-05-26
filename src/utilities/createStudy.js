/**创建内置指标 */
const createStudy = (stance, ...config) => {
  // console.log('创建了指标')
  stance.chart().createStudy(...config);
};

/**通用画线，线不根据时间轴变化，有缓存则不重绘 */
const createMultipointShapeCommon = (
  that,
  shape,
  list,
  cacheList,
  overrides
) => {
  for (let key in list) {
    /**第一个点和已画过的点不画线 */
    if (key >= 1 && !cacheList.has(list[key].id)) {
      const shapeId = that.widget.chart().createMultipointShape(
        [
          {
            time: list[key].time,
            price: list[key].price,
          },
          {
            time: list[key - 1].time,
            price: list[key - 1].price,
          },
        ],
        {
          shape: shape,
          lock: true,
          overrides,
        }
      );
      /**缓存已划过的点和形状ID以便后续清除 */
      list[key].shapeId = shapeId;
      cacheList.set(list[key].id, list[key]);
    }
  }
};

/**通用画线，线需要根据时间轴变化，有缓存则清掉缓存并重绘 */
const createMultipointShapeCommonClear = (
  that,
  shape,
  list,
  cacheList,
  overrides,
  to
) => {
  /**每次清除之前画的线 */
  clearCache(that, that[cacheList]);
  that[cacheList] = new Map();
  for (let key in list) {
    /**第一个点不画线 */
    if (key >= 1) {
      /**画连接线 */
      //   const shapeId = that.widget.chart().createMultipointShape(
      //     [
      //       {
      //         time: list[key].time,
      //         price: list[key].price,
      //       },
      //       {
      //         time: list[key - 1].time,
      //         price: list[key - 1].price,
      //       },
      //     ],
      //     {
      //       shape: shape,
      //       lock: true,
      //       overrides,
      //     }
      //   );
      /**画延长线，需要计算出延长线的终点 */
      const shapeIdMore = that.widget.chart().createMultipointShape(
        [
          {
            time: to,
            price:
              ((list[key].price - list[key - 1].price) *
                (to - list[key - 1].time)) /
                (list[key].time - list[key - 1].time) +
              list[key - 1].price,
          },
          {
            time: list[key - 1].time,
            price: list[key - 1].price,
          },
        ],
        {
          shape: shape,
          lock: true,
          overrides,
        }
      );
      /**缓存已画过的点和形状ID以便后续清除 */
      //   list[key].shapeId = shapeId;
      list[key].shapeIdMore = shapeIdMore;
      that[cacheList].set(list[key].id, list[key]);
    }
  }
};

/**清除缓存 */
const clearCache = (that, cacheList) => {
  for (let item of cacheList) {
    if (item[1].shapeId) {
      that.widget.chart().removeEntity(item[1].shapeId);
    }
    if (item[1].shapeIdMore) {
      that.widget.chart().removeEntity(item[1].shapeIdMore);
    }
  }
};

export {
  createStudy,
  createMultipointShapeCommon,
  createMultipointShapeCommonClear,
  clearCache,
};
