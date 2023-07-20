---
title: Java中的流库与时间类
sidebar_position: 8
keywords:
  - Java
tags:
  - Java
  - 学习笔记
  - 基础
  - 反射
  - 注解
  - 泛型
  - 集合
  - 多线程
last_update:
  date: 2023-07-01
  author: EasonShu
---
![Java](https://img1.baidu.com/it/u=1674108507,3962600426&fm=253&fmt=auto&app=138&f=JPEG?w=889&h=500)

## 一 Java 中的流库
Stream 是 Java8 中处理集合的关键抽象概念，它可以指定你希望对集合进行的操作，可以执行非常复杂的查找、过滤和映射数据等操作。使用Stream API 对集合数据进行操作，就类似于使用 SQL 执行的数据库查询。也可以使用 Stream API 来并行执行操作。简而言之，Stream API 提供了一种高效且易于使用的处理数据的方式。
### 1.1 引子

```java
package Stream;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * @Author shu
 * @Date: 2022/01/11/ 20:32
 * @Description 流的与迭代的比较
 **/
public class Creat_Stream {
    public static void main(String[] args) {

        List<Integer>  data=new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            data.add(new Random().nextInt());
        }

        System.out.println(data);

        // 需求：计算集合中大于0的个数


        // 迭代
        int count =0;
        for (Integer integer : data) {
            if(integer>0){
                count++;
            }
        }
        System.out.println(count);


        // 使用顺序流计算
        long all = data.stream().filter(w -> w > 0).count();
        System.out.println(all);


        // 使用并行流计算
        long all = data.parallelStream().filter(w -> w > 0).count();
        System.out.println(all);

    }
}
```

- 流的版本比循环版本要更易于阅读，因为我们不必扫描整个代码去查找过滤和计数操作，方法名就可以直接告诉我们其代码意欲何为。
- 流并不存储其元素。这些元素可能存储在底层的集合中，或者是按需生成的。
- 流的操作不会修改其数据源。例如，filter方法不会从新的流中移除元素，而是会生成一个新的流，其中不包含被过滤掉的元素。
- 流的操作是尽可能惰性执行的。这意味着直至需要其结果时，操作才会执行。

> 基本步骤


- 创建一个流。
- 指定将初始流转换为其他流的中间操作，可能包含多个步骤。
- 应用终止操作，从而产生结果。这个操作会强制执行之前的惰性操作。从此之后，这个流就再也不能用了。

> 方法总结


- `Stream<T> filter（Predicate<? super T> p）`:产生一个流，其中包含当前流中满足P的所有元素。(过滤)。
- `long count（）`:产生当前流中元素的数量。这是一个终止操作。
- `default Stream<E> stream（）`:产生当前集合中所有元素的顺序流。
- `default Stream<E> parallelStream（）`:产生当前集合中所有元素的并行流。

### 1.2 分类
![20181223012834784.png](https://cdn.nlark.com/yuque/0/2022/png/12426173/1644580269366-d0fb9959-6318-494d-8230-b77e889feced.png#clientId=u76365012-2072-4&from=ui&id=uae37ea3c&originHeight=290&originWidth=860&originalType=binary&ratio=1&rotation=0&showTitle=false&size=35355&status=done&style=none&taskId=u47f728a7-cb94-435a-bdb4-352632576ac&title=)

- 无状态：指元素的处理不受之前元素的影响。
- 有状态：指该操作只有拿到所有元素之后才能继续下。
- 非短路操作：指必须处理所有元素才能得到最终结果。
- 短路操作：指遇到某些符合条件的元素就可以得到最终结果，如 A || B，只要A为true，则无需判断B的结果。

### 1.3 基本用法

#### 1.3.1 Collection下的 stream() 和 parallelStream() 方法

- `default Stream<E> stream（）`:产生当前集合中所有元素的顺序流。
- `default Stream<E> parallelStream（）`:产生当前集合中所有元素的并行流。

```java
List<String> list = new ArrayList<>();
Stream<String> stream = list.stream(); //获取一个顺序流
Stream<String> parallelStream = list.parallelStream(); //获取一个并行流
```

#### 1.3.2 Arrays 中的 stream() 方法，将数组转成流

- `Arrays.stream(nums)`:将数组转成流

```java
package Stream;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * @Author shu
 * @Date: 2022/01/11/ 20:32
 * @Description 数组
 **/
public class Creat_Stream {
    public static void main(String[] args) {

        Integer[] data = new Integer[10];
        for (int i = 0; i < 10; i++) {
            data[i]=new Random().nextInt();
        }
        // 需求：计算集合中大于0的个数


        // 迭代
        int count =0;
        for (Integer integer : data) {
            if(integer>0){
                count++;
            }
        }
        System.out.println(count);


        // 使用流计算
        long all = Arrays.stream(data).filter(w -> w > 0).count();
        System.out.println(all);

    }
}
```

#### 1.3.3 静态方法

- `static<T>Stream<T>of（T... values）`:产生一个元素为给定值的流。
- `static<T>Stream<T>empty（）`:产生一个不包含任何元素的流
- `static<T>Stream<T>generate（Supplier<T>s）`:产生一个无限流，它的值是通过反复调用函数s而构建的。
- `static<T>Stream<T>iterate（T seed，UnaryOperator<T>f）`:产生一个无限流，它的元素包含种子、在种子上调用f产生的值、在前一个元素上调用f产生的值。

```java
package Stream;

import java.util.stream.Stream;

/**
 * @Author shu
 * @Date: 2022/01/12/ 9:25
 * @Description 静态方法
 **/
public class Static_Stream {
    public static void main(String[] args) {
        Stream<Integer> stream = Stream.of(1,2,3,4,5,6);

        Stream<Integer> stream2 = Stream.iterate(0, (x) -> x + 2).limit(6);
        stream2.forEach(System.out::println); // 0 2 4 6 8 10

        Stream<Double> stream3 = Stream.generate(Math::random).limit(2);
        stream3.forEach(System.out::println);
    }
}
```

#### 1.3.4 文件流

- `BufferedReader.lines()`方法，将每行内容转成流
- `Pattern.splitAsStream()`方法，将字符串分隔成流

```java
BufferedReader reader = new BufferedReader(new FileReader("F:\\test_stream.txt"));
Stream<String> lineStream = reader.lines();
lineStream.forEach(System.out::println);
```

```java
Pattern pattern = Pattern.compile(",");
Stream<String> stringStream = pattern.splitAsStream("a,b,c,d");
stringStream.forEach(System.out::println);
```

### 1.4 **流的中间操作**

#### 1.4.1 筛选与切片

`Stream<T>filter（Predicate<?super T>predicate）`

- `filter`：过滤流中的某些元素

`Stream<T>limit（long maxSize）`

- `limit(n)`：获取n个元素

`Stream<T>skip（long n）`

- `skip(n)`：跳过n元素，配合limit(n)可实现分页

`Stream<T>distinct（）`

- `distinct`：通过流中元素的 hashCode() 和 equals() 去除重复元素

`static<T>Stream<T>concat（Stream<?extends T>a，Stream<?extends T>b）`

- `concat`：产生一个流，它的元素是a的元素后面跟着b的元素

```java
package Stream;

import java.util.stream.Stream;

/**
 * @Author shu
 * @Date: 2022/01/12/ 9:37
 * @Description 切片与筛选
 **/
public class Main_Stream {
    public static void main(String[] args) {
        Stream<Integer> stream = Stream.of(6, 4, 6, 7, 3, 9, 8, 10, 12, 14, 14);
        Stream<Integer> newStream = stream.filter(s -> s > 5) //6 6 7 9 8 10 12 14 14
                .distinct() //6 7 9 8 10 12 14
                .skip(2) //9 8 10 12 14
                .limit(2); //9 8
        newStream.forEach(System.out::println);

    }
}
```

#### 1.4.2 映射

`<R>Stream<R>map（Function<?super T，?extends R>mapper）`

- `map`：接收一个函数作为参数，该函数会被应用到每个元素上，并将其映射成一个新的元素。

`<R>Stream<R>f latMap（Function<?super T，?extends Stream<?extendsR>>mapper）`

- `flatMap`：接收一个函数作为参数，将流中的每个值都换成另一个流，然后把所有流连接成一个流。

```java
package Stream;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

/**
 * @Author shu
 * @Date: 2022/01/12/ 9:43
 * @Description 映射
 **/
public class Map_Stream {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("a,b,c", "1,2,3");

        //将每个元素转成一个新的且不带逗号的元素
        Stream<String> s1 = list.stream().map(s -> s.replaceAll(",", ""));
        s1.forEach(System.out::println); // abc  123

        Stream<String> s3 = list.stream().flatMap(s -> {
            //将每个元素转换成一个stream
            String[] split = s.split(",");
            Stream<String> s2 = Arrays.stream(split);
            return s2;
        });
        s3.forEach(System.out::println); // a b c 1 2 3
    }
}
```

#### 1.4.3 排序

`Stream<T>sorted（）`

- `sorted()`：自然排序，流中元素需实现Comparable接口

`Stream<T>sorted（Comparator<?super T>comparator）`

- `sorted(Comparator com)`：定制排序，自定义Comparator排序器

```java
package Stream;

import java.util.Arrays;
import java.util.List;

/**
 * @Author shu
 * @Date: 2022/01/12/ 9:46
 * @Description 排序
 **/
public class Sort_Stream {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("aa", "ff", "dd");
        //String 类自身已实现Compareable接口
        list.stream().sorted().forEach(System.out::println);// aa dd ff

        Student s1 = new Student("aa", 10);
        Student s2 = new Student("bb", 50);
        Student s3 = new Student("aa", 30);
        Student s4 = new Student("dd", 40);
        List<Student> studentList = Arrays.asList(s1, s2, s3, s4);

        //自定义排序：先按姓名升序，姓名相同则按年龄升序
        studentList.stream().sorted(
                (o1, o2) -> {
                    if (o1.getName().equals(o2.getName())) {
                        return o1.getAge() - o2.getAge();
                    } else {
                        return o1.getName().compareTo(o2.getName());
                    }
                }
        ).forEach(System.out::println);
    }
}

class Student{
    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public Student() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```

#### 1.4.4 消费

`Stream<T>peek（Consumer<?super T>action）`

-  `peek`：如同于map，能得到流中的每一个元素。但map接收的是一个Function表达式，有返回值；而peek接收的是Consumer表达式，没有返回值。
```java
package Stream;

import java.util.Arrays;
import java.util.List;

/**
 * @Author shu
 * @Date: 2022/01/12/ 9:52
 * @Description
 **/
public class Pink_Stream {
    public static void main(String[] args) {
        Student s1 = new Student("aa", 10);
        Student s2 = new Student("bb", 20);
        List<Student> studentList = Arrays.asList(s1, s2);

        studentList.stream()
                .peek(o -> o.setAge(100))
                .forEach(System.out::println);
    }
}
```

### 1.5 流的简约操作

-  `Optional<T>`对象是一种包装器对象，要么包装了类型T的对象，要么没有包装任何对象。对于第一种情况，我们称这种值为存在的。`Optional<T>`类型被当作一种更安全的方式，用来替代类型T的引用，这种引用要么引用某个对象，要么为null。但是，它只有在正确使用的情况下才会更安全，
-  `Optional<T>max（Comparator<?super T>comparator）`:分别产生这个流的最大元素
-  `Optional<T>min（Comparator<?super T>comparator）`:分别产生这个流的最小元素
-  `Optional<T>findFirst（）`:分别产生这个流的任意一个元素，如果这个流为空，会产生一个空的Optional对象。
-  `Optional<T>findAny（）`:分别产生这个流的任意一个元素，如果这个流为空，会产生一个空的Optional对象。
-  `boolean anyMatch（Predicate<？super T>predicate）`:这个流中任意元素匹配给定断言时返回true。
-  `boolean allMatch（Predicate<？super T>predicate）`:这个流中所有元素给定断言时返回true。
-  `boolean noneMatch（Predicate<？super T>predicate）`:这个流中没有任何元素匹配给定断言时返回true。

```java
package Stream;

import java.util.Arrays;
import java.util.List;

/**
 * @Author shu
 * @Date: 2022/01/12/ 10:10
 * @Description
 **/
public class JianYue_Stream {
    public static void main(String[] args) {
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);

        boolean allMatch = list.stream().allMatch(e -> e > 10); //false
        boolean noneMatch = list.stream().noneMatch(e -> e > 10); //true
        boolean anyMatch = list.stream().anyMatch(e -> e > 4);  //true

        Integer findFirst = list.stream().findFirst().get(); //1
        Integer findAny = list.stream().findAny().get(); //1

        long count = list.stream().count(); //5
        Integer max = list.stream().max(Integer::compareTo).get(); //5
        Integer min = list.stream().min(Integer::compareTo).get(); //1
    }
}
```

### 1.6 流的收集操作

- `collect`：接收一个Collector实例，将流中元素收集成另外一个数据结构。
- `Collector<T, A, R>` 是一个接口，有以下5个抽象方法：
- `Supplier<A> supplier()`：创建一个结果容器A
- `BiConsumer<A, T> accumulator()`：消费型接口，第一个参数为容器A，第二个参数为流中元素T。
- `BinaryOperator<A> combiner()`：函数接口，该参数的作用跟上一个方法(reduce)中的combiner参数一样，将并行流中各 个子进程的运行结果(accumulator函数操作后的容器A)进行合并。
- `Function<A, R> finisher()`：函数式接口，参数为：容器A，返回类型为：collect方法最终想要的结果R。
- `Set<Characteristics> characteristics()`：返回一个不可变的Set集合，用来表明该Collector的特征。

```java
package Stream;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @Author shu
 * @Date: 2022/01/12/ 10:31
 * @Description 流的收集操作
 **/
public class Collect_Stream {
    public static void main(String[] args) {
        Student s1 = new Student("aa", 10);
        Student s2 = new Student("bb", 20);
        Student s3 = new Student("cc", 10);
        List<Student> list = Arrays.asList(s1, s2, s3);

        //装成list
        List<Integer> ageList = list.stream().map(Student::getAge).collect(Collectors.toList()); // [10, 20, 10]

        //转成set
        Set<Integer> ageSet = list.stream().map(Student::getAge).collect(Collectors.toSet()); // [20, 10]

        //转成map,注:key不能相同，否则报错
        Map<String, Integer> studentMap = list.stream().collect(Collectors.toMap(Student::getName, Student::getAge)); // {cc=10, bb=20, aa=10}

        //字符串分隔符连接
        String joinName = list.stream().map(Student::getName).collect(Collectors.joining(",", "(", ")")); // (aa,bb,cc)

        //聚合操作
        //1.学生总数
        Long count = list.stream().collect(Collectors.counting()); // 3
        //2.最大年龄 (最小的minBy同理)
        Integer maxAge = list.stream().map(Student::getAge).collect(Collectors.maxBy(Integer::compare)).get(); // 20
        //3.所有人的年龄
        Integer sumAge = list.stream().collect(Collectors.summingInt(Student::getAge)); // 40
        //4.平均年龄
        Double averageAge = list.stream().collect(Collectors.averagingDouble(Student::getAge)); // 13.333333333333334
        // 带上以上所有方法
        DoubleSummaryStatistics statistics = list.stream().collect(Collectors.summarizingDouble(Student::getAge));
        System.out.println("count:" + statistics.getCount() + ",max:" + statistics.getMax() + ",sum:" + statistics.getSum() + ",average:" + statistics.getAverage());

        //分组
        Map<Integer, List<Student>> ageMap = list.stream().collect(Collectors.groupingBy(Student::getAge));
        //多重分组,先根据类型分再根据年龄分
        Map<Integer, Map<Integer, List<Student>>> typeAgeMap = list.stream().collect(Collectors.groupingBy(Student::getAge, Collectors.groupingBy(Student::getAge)));

        //分区
        //分成两部分，一部分大于10岁，一部分小于等于10岁
        Map<Boolean, List<Student>> partMap = list.stream().collect(Collectors.partitioningBy(v -> v.getAge() > 10));

        //规约
        Integer allAge = list.stream().map(Student::getAge).collect(Collectors.reducing(Integer::sum)).get(); //40
    }
}
```

- 多个字段分组合计
```java
package Stream;


import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @Author shu
 * @Date: 2022/02/22/ 10:39
 * @Description 分组合计
 **/
public class Test {
    public static void main(String[] args) {
        Person s1 = new Person("aa", 10,20);
        Person s4 = new Person("aa", 120,20);
        Person s2 = new Person("bb", 20,30);
        Person s5 = new Person("bb", 210,30);
        Person s3 = new Person("cc", 10,40);
        Person s6 = new Person("cc", 120,40);
        List<Person> list = Arrays.asList(s1, s2, s3,s4,s5,s6);
        Map<String, Integer> map = list.stream().collect(Collectors.groupingBy(Person::getName, Collectors.summingInt(Person::getScore)));
        Map<String, Integer> maps = list.stream().collect(Collectors.groupingBy(Person::getName, Collectors.summingInt(Person::getAge)));
        System.out.println(map.get("aa"));
        System.out.println(maps.get("aa"));
        Map<String, long[]> collect = list.stream().collect(Collectors.toMap(k -> k.getName(), v -> new long[]{v.getAge(), v.getScore(),v.getAge()}, (x, y) -> {
            x[0] = x[0] + y[0];
            x[1] = x[1] + y[1];
            return x;
        }));
        System.out.println(collect.get("aa")[0]);
        System.out.println(collect.get("aa")[1]);

    }

}

class Person {
    private String name;
    private int age;
    private int score;

    public Person(String name, int age, int score) {
        this.name = name;
        this.age = age;
        this.score = score;
    }

    public Person() {
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }




    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", score=" + score +
                '}';
    }
}

```

## 二 日期和时间API

### 2.1 LocalDate
![epub_34339937_1058.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/12426173/1644580336048-3a623ca0-093e-4f35-84cf-6425f2a621df.jpeg#clientId=u76365012-2072-4&from=ui&id=u5241c2f2&originHeight=194&originWidth=1152&originalType=binary&ratio=1&rotation=0&showTitle=false&size=74358&status=done&style=none&taskId=ua198f993-ecf4-4ff5-8e79-99d3399739c&title=)

- LocalDate是带有年、月、日的日期。为了构建LocalDate对象，可以使用now或of静态方法.
- 与UNIX和java.util.Date中使用的月从0开始计算而年从1900开始计算的不规则的惯用法不同，你需要提供通常使用的月份的数字。或者，你可以使用Month枚举。
- 除了LocalDate之外，还有MonthDay、YearMonth和Year类可以描述部分日期。例如，12月25日（没有指定年份）可以表示成一个MonthDay对象。
- TemporalAdjusters类提供了大量用于常见调整的静态方法。你可以将调整方法的结果传递给with方法。

![epub_34339937_1070.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/12426173/1644580344453-9da9da04-9e62-482f-b980-5d609145edb9.jpeg#clientId=u76365012-2072-4&from=ui&id=uc1674df0&originHeight=341&originWidth=1152&originalType=binary&ratio=1&rotation=0&showTitle=false&size=147711&status=done&style=none&taskId=ub2b5877c-655f-413c-82b4-0b5ca830c44&title=)

```java
package Date;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.TemporalAdjuster;
import java.time.temporal.TemporalAdjusters;


/**
 * @Author shu
 * @Date: 2022/01/17/ 15:50
 * @Description
 **/
public class LocalDateWays {
    public static void main(String[] args) {
        // 获取当前日期
        LocalDate localDate = LocalDate.now();
        System.out.println("当前日期"+localDate);
        // 指定日期
        LocalDate date = LocalDate.of(2021, 12, 1);
        System.out.println("当前日期"+date);
        // 前多少天
        LocalDate days = localDate.plusDays(-5);
        System.out.println("当前日期"+days);
        // 前多少月
        LocalDate months = localDate.plusMonths(1);
        System.out.println("当前日期"+months);
        // 前多少年
        LocalDate years = localDate.plusYears(-1);
        //LocalDate years = localDate.plusYears(1);
        System.out.println("当前日期"+years);
        // 某月的第一个星期二
        LocalDate day = LocalDate.of(years.getYear(), Month.from(months), 1).with(TemporalAdjusters.nextOrSame(DayOfWeek.TUESDAY));
        System.out.println(day);
    }
}
```

### 2.2 LocalTime
![epub_34339937_1076.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/12426173/1644580354557-b31ff0c0-8c59-48dc-9057-992f389e5aa2.jpeg#clientId=u76365012-2072-4&from=ui&id=u3df71ce2&originHeight=342&originWidth=749&originalType=binary&ratio=1&rotation=0&showTitle=false&size=40408&status=done&style=none&taskId=u7eb405c5-9752-46d4-9eef-ef1ff477c97&title=)

- LocalTime表示当日时刻，例如15：30：00。可以用now或of方法创建其实例。
- plus和minus操作是按照一天24小时循环操作的。

```java
package Date;

import java.time.LocalTime;

/**
 * @Author shu
 * @Date: 2022/01/17/ 16:22
 * @Description
 **/
public class LocalTimeWays {
    public static void main(String[] args) {
        // 当前时间
        LocalTime time = LocalTime.now();
        System.out.println("当前时间"+time);
        // 指定时间
        LocalTime localTime = LocalTime.of(12, 30);
        System.out.println("当前时间"+localTime);
        // 加上多少时间
        LocalTime plusHours = time.plusHours(3);
        LocalTime plusMinutes = time.plusMinutes(60);
        LocalTime plusSeconds = time.plusSeconds(60);
        // 减去多少时间
        LocalTime minusHours = time.minusHours(3);
        LocalTime minusMinutes = time.minusMinutes(30);
        LocalTime minusSeconds = time.minusSeconds(30);

    }
}
```

### 2.3 LocalDateTime

- 其实就是前两者的结合

```java
package Date;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * @Author shu
 * @Date: 2022/01/17/ 16:32
 * @Description
 **/
public class LocalDateTimeWays {
    public static void main(String[] args) {
        LocalTime localTime = LocalTime.now();
        LocalDate localDate = LocalDate.now();
        // LocalDateTime包括LocalDate和LocalTime
        LocalDateTime localDateTime = LocalDateTime.of(localDate, localTime);
        System.out.println("localDateTime = " + localDateTime);
        LocalDateTime dateTime = LocalDateTime.now();
        System.out.println(dateTime);
        //LocalDateTime 和 LocalDate, LocalTime 相互转换
        LocalDate localDate1 = localDateTime.toLocalDate();
        LocalTime localTime1 = localDateTime.toLocalTime();

    }
}
```
