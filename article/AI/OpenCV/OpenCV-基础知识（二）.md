---
title: OpenCV 基础知识（二）
sidebar_position: 3
keywords:
  -  OpenCV
tags:
  - OpenCV
  - Python
  - 学习笔记
last_update:
  date: 2024-09-01
  author: EasonShu
---

- 官网：https://apachecn.github.io/opencv-doc-zh/#/

## 1.1 图像几何变换

- OpenCV 提供了两个转换函数，**[cv.warpAffine](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#ga0203d9ee5fcd28d40dbc4a1ea4451983)** 和 **[cv.warpPerspective](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#gaf73673a7e8e18ec6963e3774e6a94b87)\**，可以进行各种转换。***
- **[cv.warpAffine](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#ga0203d9ee5fcd28d40dbc4a1ea4451983)** 采用 2x3 变换矩阵，而 **[cv.warpPerspective](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#gaf73673a7e8e18ec6963e3774e6a94b87)** 采用 3x3 变换矩阵作为输入。

### 1.1.1 缩放

- 缩放是调整图片的大小。
- OpenCV 使用 **[cv.resize()](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#ga47a974309e9102f5f08231edc7e7529d)** 函数进行调整。
- 可以手动指定图像的大小，也可以指定比例因子。可以使用不同的插值方法。
- 对于下采样(图像上缩小)，最合适的插值方法是 **[cv.INTER_AREA](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#gga5bb5a1fea74ea38e1a5445ca803ff121acf959dca2480cc694ca016b81b442ceb)** 对于上采样(放大),最好的方法是 **[cv.INTER_CUBIC](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#gga5bb5a1fea74ea38e1a5445ca803ff121a55e404e7fa9684af79fe9827f36a5dc1)** （速度较慢）和 **[cv.INTER_LINEAR](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#gga5bb5a1fea74ea38e1a5445ca803ff121ac97d8e4880d8b5d509e96825c7522deb)** (速度较快)。默认情况下，所使用的插值方法都是 **[cv.INTER_AREA](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#gga5bb5a1fea74ea38e1a5445ca803ff121acf959dca2480cc694ca016b81b442ceb)** 。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:01
Author:   EasonShu
Version:  V 0.1
File:     ResizeDemo.py
Describe: 
"""
import cv2

if __name__ == '__main__':
    image_path = 'images/img_2.png'
    image = cv2.imread(image_path)
    print(image.shape)
    imagesNew= cv2.resize(image, (640, 480), interpolation=cv2.INTER_AREA)
    cv2.imshow('resize', imagesNew)
    cv2.waitKey(0)
```

### 1.1.2 平移变换

- 平移变换是物体位置的移动。如果知道 **（x，y）** 方向的偏移量，假设为 **(t_x,t_y)\**，则可以创建如下转换矩阵 \**M**：

在 OpenCV 中使用 `warpAffine` 函数时，你需要提供三个主要参数：

1. **源图像（src）** - 你想转换的原始图像。
2. **输出图像（dst）** - 转换后的图像将会存储在这里。
3. **变换矩阵（M）** - 这是一个 2x3 的矩阵，包含了仿射变换的系数。这个矩阵可以由平移向量和旋转、缩放等操作的系数组成。

- opencv 提供了一个函数， **[cv.getRotationMatrix2D](https://docs.opencv.org/4.0.0/da/d54/group__imgproc__transform.html#gafbbc470ce83812914a70abfb604f4326)** 。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:04
Author:   EasonShu
Version:  V 0.1
File:     WarpAffineDemo.py
Describe: 
"""
import cv2

if __name__ == '__main__':
    image_path = 'images/img_2.png'
    image = cv2.imread(image_path)
    image_height, image_width = image.shape[:2]
    print(image_height, image_width)
    center = (image_width / 2, image_height / 2)
    angle = 30
    scale = 1
    # 定义仿射变换矩阵:30度
    M = cv2.getRotationMatrix2D(center, angle, scale)
    rotated = cv2.warpAffine(image, M, (image_width, image_height))
    cv2.imshow('rotated', rotated)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

![image-20240917140754606](images/image-20240917140754606-17265532779511.png)

### 1.1.3 仿射变换

1. **平移（Translation）**： 平移是将图像中的每一个像素都沿着水平和垂直方向移动固定的距离。

1. **旋转（Rotation）**： 绕着图像的某一点（通常是中心点）旋转一定的角度。变换矩阵为：
2. **缩放（Scaling）**： 按照特定的比例因子改变图像的大小。
3. **剪切（Shear）**： 在给定的方向上按照一定的比例改变形状。

**案例 1：图像平移**

假设我们需要将一幅图像在水平方向上向右平移 50 个像素，在垂直方向上向下平移 30 个像素。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:04
Author:   EasonShu
Version:  V 0.1
File:     WarpAffineDemo.py
Describe: 
"""
import cv2
import numpy as np

if __name__ == '__main__':
    image_path = 'images/img_2.png'
    image = cv2.imread(image_path)
    # 设置平移矩阵
    tx = 50
    ty = 30
    M = np.float32([[1, 0, tx], [0, 1, ty]])
    # 应用仿射变换
    translated_image = cv2.warpAffine(image, M, (image.shape[1], image.shape[0]))
    # 显示结果
    cv2.imshow('Translated Image', translated_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

![image-20240917141451226](images/image-20240917141451226.png)

 **2：图像旋转**

如果我们想将图像顺时针旋转 45 度，并确保旋转后图像的尺寸不变。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:04
Author:   EasonShu
Version:  V 0.1
File:     WarpAffineDemo.py
Describe: 
"""
import cv2
import numpy as np

if __name__ == '__main__':
    image_path = 'images/img_2.png'
    image = cv2.imread(image_path)
    # 获取图像尺寸
    rows, cols, _ = image.shape

    # 计算旋转中心
    center = (cols / 2, rows / 2)

    # 设置旋转矩阵
    angle = 45  # 旋转角度
    scale = 1.0  # 缩放比例
    M = cv2.getRotationMatrix2D(center, angle, scale)

    # 应用仿射变换
    rotated_image = cv2.warpAffine(image, M, (cols, rows))

    # 显示结果
    cv2.imshow('Rotated Image', rotated_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

![image-20240917141547957](images/image-20240917141547957.png)

**案例 3：图像缩放**

如果我们要将图像按比例缩小到原来的 50%，并且保持图像的中心位置不变。



```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:04
Author:   EasonShu
Version:  V 0.1
File:     WarpAffineDemo.py
Describe: 
"""
import cv2
import numpy as np

if __name__ == '__main__':
    image_path = 'images/img_2.png'
    image = cv2.imread(image_path)
    # 获取图像尺寸
    rows, cols, _ = image.shape

    # 计算缩放矩阵
    scale = 0.5
    M = np.float32([[scale, 0, (1 - scale) * cols / 2],
                    [0, scale, (1 - scale) * rows / 2]])

    # 应用仿射变换
    scaled_image = cv2.warpAffine(image, M, (int(cols * scale), int(rows * scale)))

    # 显示结果
    cv2.imshow('Scaled Image', scaled_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

![image-20240917141705155](images/image-20240917141705155.png)

**案例 4：图像剪切**

如果我们要对图像进行剪切变换，使得图像的左侧向右倾斜。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:04
Author:   EasonShu
Version:  V 0.1
File:     WarpAffineDemo.py
Describe: 
"""
import cv2
import numpy as np

if __name__ == '__main__':
    image_path = 'images/img_2.png'
    image = cv2.imread(image_path)
    # 设置剪切矩阵
    sh = 0.5  # 剪切因子
    M = np.float32([[1, sh, -sh * image.shape[1] / 2], [0, 1, 0]])

    # 应用仿射变换
    sheared_image = cv2.warpAffine(image, M, (int(image.shape[1] * (1 + abs(sh))), image.shape[0]))

    # 显示结果
    cv2.imshow('Sheared Image', sheared_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```

![image-20240917141740004](images/image-20240917141740004.png)

### 1.1.4 透视变换

透视转换（Perspective Transformation）是一种几何变换技术，用于模拟从一个视角观察到另一个视角的变化，常用于纠正图像中的透视失真。这种变换对于处理非平面场景尤其有用，比如校正倾斜的文档图像、调整摄像头视角或者进行虚拟现实中的视图变换等。

在二维空间中，透视变换通过一个 3x3 的矩阵来实现，这个矩阵能够描述四边形到四边形之间的映射。与仿射变换不同的是，透视变换能够处理图像中的非平行线，使其在变换后依然保持非平行状态。

**透视变换的原理**

透视变换的数学模型可以用以下方程表示：


$$
\begin{align*}
x' &= \frac{a_{11}x + a_{12}y + a_{13}}{a_{31}x + a_{32}y + a_{33}} \\
y' &= \frac{a_{21}x + a_{22}y + a_{23}}{a_{31}x + a_{32}y + a_{33}}
\end{align*}
$$


这里的 \((x, y)\) 是原图上的点，而 \((x', y')\) 是变换后的点。

**使用 OpenCV 进行透视变换**

在 OpenCV 中，可以使用 `cv2.getPerspectiveTransform()` 和 `cv2.warpPerspective()` 来实现透视变换。首先需要确定四个对应点，然后计算出透视变换矩阵，最后应用该矩阵进行变换。

假设我们有一张图片，其中包含一个矩形区域，但由于相机的角度问题，这个矩形看起来是倾斜的。我们希望将其校正为标准的矩形。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:22
Author:   EasonShu
Version:  V 0.1
File:     PerspectiveTransform.py
Describe: 
"""
import cv2
import numpy as np

if __name__ == '__main__':
    image = cv2.imread('images/test02.jpeg')
    # 定义源图像中的四个角点
    src_points = np.float32([[100, 100], [300, 100], [300, 300], [100, 300]])
    # 定义目标图像中的四个角点
    dst_points = np.float32([[0, 0], [300, 0], [300, 300], [0, 300]])
    # 计算透视变换矩阵
    M = cv2.getPerspectiveTransform(src_points, dst_points)
    # 应用透视变换
    width, height = 1920, 1080
    transformed_image = cv2.warpPerspective(image, M, (width, height))
    # 显示结果
    cv2.imshow('Transformed Image', transformed_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

```

在这个例子中，我们定义了源图像中的四个角点 `src_points` 和目标图像中的四个角点 `dst_points`。`cv2.getPerspectiveTransform()` 函数计算出透视变换所需的矩阵 `M`，然后使用 `cv2.warpPerspective()` 函数应用这个矩阵来产生变换后的图像。

## 2.1 图像阈值

### 2.1.1 普通阈值方法

图像阈值化（Thresholding）是图像处理中的一种基本技术，用于简化图像并提取感兴趣的信息。通过设定一个阈值，可以将图像分割成两部分：前景和背景。通常，如果像素值高于设定的阈值，则将其标记为前景（例如白色），否则标记为背景（例如黑色）。

在 OpenCV 中，可以使用 `cv2.threshold()` 函数来进行阈值化处理。这个函数接受几个参数，包括输入图像、阈值、最大值以及阈值类型。

**阈值类型**

OpenCV 支持几种不同的阈值类型：

1. **cv2.THRESH_BINARY**：如果像素值大于阈值，则设为最大值，否则设为零。
2. **cv2.THRESH_BINARY_INV**：如果像素值大于阈值，则设为零，否则设为最大值。
3. **cv2.THRESH_TRUNC**：如果像素值大于阈值，则设为阈值，否则保持不变。
4. **cv2.THRESH_TOZERO**：如果像素值大于阈值，则保持不变，否则设为零。
5. **cv2.THRESH_TOZERO_INV**：如果像素值大于阈值，则设为零，否则保持不变。
6. **cv2.THRESH_OTSU**：自动计算最佳阈值（适用于单峰直方图）。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:26
Author:   EasonShu
Version:  V 0.1
File:     threshold.py
Describe: 
"""
import cv2
import numpy as np
if __name__ == '__main__':
    # 加载图像
    image = cv2.imread('images/test02.jpeg', cv2.IMREAD_GRAYSCALE)
    # 如果图像不是灰度图像，请先转换为灰度图像
    if image is None:
        print("Error: Image not found.")
    else:
        # 设定阈值和最大值
        threshold_value = 127  # 自定义阈值
        max_value = 255  # 最大值为255，即白色
        # 使用cv2.THRESH_BINARY进行二值化
        ret, binary_image = cv2.threshold(image, threshold_value, max_value, cv2.THRESH_BINARY)
        # 显示原始图像和阈值化后的图像
        cv2.imshow('Original Image', image)
        cv2.imshow('Binary Image', binary_image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

```

### 2.1.2 自适应阈值方法

- 自适应阈值方法（Adaptive Thresholding）是一种动态地为图像的不同区域选择阈值的方法。这种方法特别适用于图像的光照变化较大或背景复杂的情况，因为全局阈值在这种情况下可能无法很好地分割前景和背景。
- 在 OpenCV 中，可以使用 cv2.adaptiveThreshold() 函数来实现自适应阈值化。此函数支持两种自适应方法：
- cv2.ADAPTIVE_THRESH_MEAN_C：阈值是邻域内像素均值减去常数 C。
- cv2.ADAPTIVE_THRESH_GAUSSIAN_C：阈值是邻域内像素加权和减去常数 C，权重是像素距离中心的距离的高斯分布。

**参数说明**

`cv2.adaptiveThreshold()` 函数的基本参数包括：

- **src**：输入图像，通常是灰度图像。
- **maxValue**：超过阈值的最大值。
- **adaptiveMethod**：自适应方法的选择。
- **thresholdType**：二值化类型（例如 cv2.THRESH_BINARY 或 cv2.THRESH_BINARY_INV）。
- **blockSize**：邻域大小，通常是一个奇数，如 3、5、11 等。
- **C**：从均值或加权和中减去的常数值。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:34
Author:   EasonShu
Version:  V 0.1
File:     Adaptive Thresholding.py
Describe: 
"""
import cv2
import numpy as np

if __name__ == '__main__':
    # 加载图像
    image_path = 'images/img_2.png'
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    # 如果图像不是灰度图像，请先转换为灰度图像
    if image is None:
        print("Error: Image not found.")
    else:
        # 使用平均法进行自适应阈值化
        adaptive_mean = cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)
        # 使用高斯法进行自适应阈值化
        adaptive_gaussian = cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

        # 显示原始图像、平均法自适应阈值化图像和高斯法自适应阈值化图像
        cv2.imshow('Original Image', image)
        cv2.imshow('Adaptive Mean Threshold', adaptive_mean)
        cv2.imshow('Adaptive Gaussian Threshold', adaptive_gaussian)

        cv2.waitKey(0)
        cv2.destroyAllWindows()
```

![image-20240917143629412](images/image-20240917143629412.png)

### 2.1.3 Otsu 二值化

- Otsu 二值化（Otsu's Binarization）是一种自动确定最佳全局阈值的方法，用于将图像分割成前景和背景。这种方法由日本学者 Nobuyuki Otsu 在 1979 年提出，其核心思想是通过最大化类间方差来找到最优的阈值。这种方法特别适合于具有双峰直方图的图像，即图像中有明显的前景和背景。

**Otsu 方法的工作原理**

Otsu 方法通过分析图像的灰度直方图来确定最佳的阈值。具体步骤如下：

1. **计算图像的灰度直方图**：统计图像中每个灰度级出现的频率。
2. **遍历所有可能的阈值**：从最小的灰度级开始，一直到最大的灰度级。
3. **计算类间方差**：对于每个可能的阈值，计算前景和背景的类间方差。
4. **选择最大类间方差对应的阈值**：选择使类间方差最大的那个阈值作为最佳阈值。

**使用 OpenCV 进行 Otsu 二值化**

在 OpenCV 中，可以通过 `cv2.threshold()` 函数结合 `cv2.THRESH_OTSU` 标志来实现 Otsu 二值化。

```python
# _*_ coding: utf-8 _*_
"""
Time:     2024/9/17 下午2:38
Author:   EasonShu
Version:  V 0.1
File:     Otsu.py
Describe: 
"""
if __name__ == '__main__':
    import cv2
    import numpy as np
    # 加载图像
    image_path = 'images/img_2.png'
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # 如果图像不是灰度图像，请先转换为灰度图像
    if image is None:
        print("Error: Image not found.")
    else:
        # 使用 Otsu 方法自动确定阈值
        ret, otsu_image = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # 显示原始图像和 Otsu 二值化后的图像
        cv2.imshow('Original Image', image)
        cv2.imshow('Otsu Binarized Image', otsu_image)

        # 打印计算出的最佳阈值
        print(f"Optimal threshold value calculated by Otsu's method: {ret}")

        cv2.waitKey(0)
        cv2.destroyAllWindows()
```

![image-20240917143939990](images/image-20240917143939990.png)