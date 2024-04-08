---
title: Zookeeper（九）客户端的启动流程
sidebar_position: 10
keywords:
  - 微服务
  - 源码分析
tags:
  - 源码分析
  - Java
  - 框架
  - 微服务
  - 学习笔记
last_update:
  date: 2024-02-17
  author: EasonShu
---


- 官网：[Apache ZooKeeper](http://zookeeper.apache.org)

ZooKeeper的客户端主要由以下几个核心组件组成。

- ZooKeeper实例：客户端的入口。
- ClientWatchManager：客户端Watcher管理器。
- HostProvider：客户端地址列表管理器。
- ClientCnxn：客户端核心线程，其内部又包含两个线程，即SendThread和EventThread。前者是一个I/O线程，主要负责ZooKeeper客户端和服务端之间的网络I/O通信；后者是一个事件线程，主要负责对服务端事件进行处理。
# 一 ZooKeeper会话的创建与连接

- ZooKeeper客户端的初始化与启动环节，实际上就是ZooKeeper对象的实例化过程

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711157193144-4ca6d6cb-eb2e-4881-a622-d26f476eac85.png#averageHue=%2324262a&clientId=u72745a01-5787-4&from=paste&height=126&id=ue3680e58&originHeight=151&originWidth=1792&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=52858&status=done&style=none&taskId=u723f0237-818e-4122-9543-ae6f4061aa7&title=&width=1493.3332739936004)

- 我们可以看到需要的参数：设置默认Watcher，设置ZooKeeper服务器地址列表，创建ClientCnxn。
- 如果在ZooKeeper的构造方法中传入一个Watcher对象的话，那么ZooKeeper就会将这个Watcher对象保存在ZKWatchManager的defaultWatcher中，作为整个客户端会话期间的默认Watcher。
## 1.1 会话的创建
```java
private final ZKWatchManager watchManager = new ZKWatchManager();


public ZooKeeper(String connectString, int sessionTimeout, Watcher watcher,
                 boolean canBeReadOnly)
throws IOException
{
    LOG.info("Initiating client connection, connectString=" + connectString
             + " sessionTimeout=" + sessionTimeout + " watcher=" + watcher);

    watchManager.defaultWatcher = watcher;

    ConnectStringParser connectStringParser = new ConnectStringParser(
        connectString);
    HostProvider hostProvider = new StaticHostProvider(
        connectStringParser.getServerAddresses());
    cnxn = new ClientCnxn(connectStringParser.getChrootPath(),
                          hostProvider, sessionTimeout, this, watchManager,
                          getClientCnxnSocket(), canBeReadOnly);
    cnxn.start();
}
```

- 通过调用ZooKeeper的构造方法来实例化一个ZooKeeper对象，在初始化过程中，会创建一个客户端的Watcher管理器：ClientWatchManager。
- 如果在构造方法中传入了一个Watcher对象，那么客户端会将这个对象作为默认Watcher保存在ClientWatchManager中。
- 对于构造方法中传入的服务器地址，客户端会将其存放在服务器地址列表管理器HostProvider中。
- ZooKeeper客户端首先会创建一个网络连接器ClientCnxn，用来管理客户端与服务器的网络交互。另外，客户端在创建ClientCnxn的同时，还会初始化客户端两个核心队列outgoingQueue和pendingQueue，分别作为客户端的请求发送队列和服务端响应的等待队列。
### 1.1.1 ClientWatchManager

- ZKWatchManager类的主要作用是管理和触发Zookeeper客户端的监视事件（watches）。
- 在Zookeeper中，监视事件是一种机制，允许客户端在Zookeeper服务上注册兴趣，当指定节点的数据发生变化或者子节点列表发生变化时，客户端会收到通知。
- 这个类中定义了三个Map类型的成员变量，分别用来存储数据监视（dataWatches）、存在监视（existWatches）和子节点监视（childWatches）的Watcher集合。Watcher是一个接口，它的实现类可以定义当特定事件发生时客户端需要执行的操作。
- materialize方法是ClientWatchManager接口的一个实现，它的作用是根据事件类型和状态来触发相应的Watcher。方法的参数包括Zookeeper的连接状态（KeeperState）、事件类型（EventType）和客户端路径（clientPath）。

根据事件类型，materialize方法会执行以下操作：

1. None类型：表示没有特定的事件发生，此时会触发默认监视器（defaultWatcher），并且如果配置了禁用自动重置监视器，并且当前连接状态不是同步连接状态，那么会清除所有的监视器集合。
2. NodeDataChanged和NodeCreated类型：表示节点数据发生变化或者新节点被创建，此时会移除与指定路径相关的数据监视器和存在监视器，并将它们添加到结果集合中。
3. NodeChildrenChanged类型：表示子节点列表发生变化，此时会移除与指定路径相关的子节点监视器，并将它们添加到结果集合中。
4. NodeDeleted类型：表示节点被删除，此时会移除与指定路径相关的数据监视器、存在监视器和子节点监视器，并将它们添加到结果集合中。如果在存在监视器中发现了一个不应该出现的节点被删除的情况，将会记录一条警告日志。
5. 其他未处理的事件类型：将会记录一条错误日志，并抛出运行时异常。
### 1.1.2 ConnectStringParser

- 解析字符串转为InetSocketAddress存在集合中
```java
    private final ArrayList<InetSocketAddress> serverAddresses = new ArrayList<InetSocketAddress>();
```

- 在3.2.0及其之后版本的ZooKeeper中，添加了“Chroot”特性[插图]，该特性允许每个客户端为自己设置一个命名空间(Namespace)。如果一个ZooKeeper客户端设置了Chroot，那么该客户端对服务器的任何操作，都将会被限制在其自己的命名空间下。
```java
 private final String chrootPath;
```
### 1.1.3 HostProvider
在ConnectStringParser解析器中会对服务器地址做一个简单的处理，并将服务器地址和相应的端口封装成一个InetSocketAddress对象，以ArrayList形式保存在ConnectStringParser.serverAddresses属性中，然后，经过处理的地址列表会被进一步封装到StaticHostProvider类中。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711800587696-f8585759-fbce-4235-956e-83ba50b6257b.png#averageHue=%231f2024&clientId=u6f9030f0-d1e4-4&from=paste&height=360&id=ue5d4b9db&originHeight=432&originWidth=1162&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=46391&status=done&style=none&taskId=u12956837-0ab2-4467-8347-22de5277838&title=&width=968.3332948552253)

- 我们可以看到默认实现：StaticHostProvider，把解析号可用的InetSocketAddress，最后进行一个打散

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711800735984-ecf1c291-9b40-433c-825e-22ce52eee534.png#averageHue=%23202125&clientId=u6f9030f0-d1e4-4&from=paste&height=223&id=u9f153a1c&originHeight=268&originWidth=1154&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=27785&status=done&style=none&taskId=uff9c6c74-7c6b-4414-b697-ab8971ffd46&title=&width=961.6666284534681)

- 通过调用StaticHostProvider的next()方法，能够从StaticHostProvider中获取一个可用的服务器地址。这个next()方法并非简单地从serverAddresses中依次获取一个服务器地址，而是先将随机打散后的服务器地址列表拼装成一个环形循环队列

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711800922589-012c6dbe-5b30-47db-b288-45b56745d48f.png#averageHue=%23f7f7f7&clientId=u6f9030f0-d1e4-4&from=paste&height=550&id=u71e45ca5&originHeight=660&originWidth=1711&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=194115&status=done&style=none&taskId=ubcdfb665-ff06-484f-af33-0a441d5ba18&title=&width=1425.8332766758094)
### 1.1.4 ClientCnxn
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711801321698-66a3b5c2-0a3a-4d5e-ac3d-2628803923cf.png#averageHue=%23dce0d8&clientId=u6f9030f0-d1e4-4&from=paste&height=661&id=u3b88aa29&originHeight=793&originWidth=970&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=218432&status=done&style=none&taskId=ucce6a0df-3006-4ad0-9b31-92a5bee69cd&title=&width=808.3333012130538)

- ClientCnxn是ZooKeeper客户端的核心工作类，负责维护客户端与服务端之间的网络连接并进行一系列网络通信。
- 客户端会创建两个核心网络线程SendThread和EventThread，前者用于管理客户端和服务端之间的所有网络I/O，后者则用于进行客户端的事件处理。
- 同时，客户端还会将ClientCnxnSocket分配给SendThread作为底层网络I/O处理器，并初始化EventThread的待处理事件队列waitingEvents，用于存放所有等待被客户端处理的事件。
```java
   public ClientCnxn(String chrootPath, HostProvider hostProvider, int sessionTimeout, ZooKeeper zooKeeper,
            ClientWatchManager watcher, ClientCnxnSocket clientCnxnSocket,
            long sessionId, byte[] sessionPasswd, boolean canBeReadOnly) {
        this.zooKeeper = zooKeeper;
        this.watcher = watcher;
        this.sessionId = sessionId;
        this.sessionPasswd = sessionPasswd;
        this.sessionTimeout = sessionTimeout;
        this.hostProvider = hostProvider;
        this.chrootPath = chrootPath;
        connectTimeout = sessionTimeout / hostProvider.size();
        readTimeout = sessionTimeout * 2 / 3;
        readOnly = canBeReadOnly;
        sendThread = new SendThread(clientCnxnSocket);
        eventThread = new EventThread();
    }
```
## 1.2 会话的连接
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711801417106-01464e50-4ebf-4720-931f-c3471de36452.png#averageHue=%23202226&clientId=u6f9030f0-d1e4-4&from=paste&height=452&id=u49e45948&originHeight=542&originWidth=997&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=79926&status=done&style=none&taskId=u5e15c727-af58-4d7c-9eea-4ba780ae16f&title=&width=830.8333003189841)
```java
    public void start() {
        sendThread.start();
        eventThread.start();
    }
```
启动SendThread和EventThread
### 1.2.1 SendThread
SendThread首先会判断当前客户端的状态，进行一系列清理性工作，为客户端发送“会话创建”请求做准备。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711801677139-ba815fd2-49e3-44cb-8fe0-e57824d7cfae.png#averageHue=%23202125&clientId=u6f9030f0-d1e4-4&from=paste&height=710&id=u09ea15dd&originHeight=852&originWidth=799&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=113367&status=done&style=none&taskId=u5e6d466f-caa1-41e7-8b14-d3918c2a0f4&title=&width=665.8333068754948)
在开始创建TCP连接之前，SendThread首先需要获取一个ZooKeeper服务器的目标地址，这通常是从HostProvider中随机获取出一个地址，然后委托给ClientCnxnSocket去创建与ZooKeeper服务器之间的TCP连接。
```java
private void startConnect() throws IOException {
            state = States.CONNECTING;

            InetSocketAddress addr;
            if (rwServerAddress != null) {
                addr = rwServerAddress;
                rwServerAddress = null;
            } else {
                addr = hostProvider.next(1000);
            }

            setName(getName().replaceAll("\\(.*\\)",
                    "(" + addr.getHostName() + ":" + addr.getPort() + ")"));
            if (ZooKeeperSaslClient.isEnabled()) {
                try {
                    String principalUserName = System.getProperty(
                            ZK_SASL_CLIENT_USERNAME, "zookeeper");
                    zooKeeperSaslClient =
                        new ZooKeeperSaslClient(
                                principalUserName+"/"+addr.getHostName());
                } catch (LoginException e) {
                    // An authentication error occurred when the SASL client tried to initialize:
                    // for Kerberos this means that the client failed to authenticate with the KDC.
                    // This is different from an authentication error that occurs during communication
                    // with the Zookeeper server, which is handled below.
                    LOG.warn("SASL configuration failed: " + e + " Will continue connection to Zookeeper server without "
                      + "SASL authentication, if Zookeeper server allows it.");
                    eventThread.queueEvent(new WatchedEvent(
                      Watcher.Event.EventType.None,
                      Watcher.Event.KeeperState.AuthFailed, null));
                    saslLoginFailed = true;
                }
            }
            logStartConnect(addr);

            clientCnxnSocket.connect(addr);
        }
```
获取到一个服务器地址后，ClientCnxnSocket负责和服务器创建一个TCP长连接。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711801969569-40720b79-b596-4586-b865-b4c92182c417.png#averageHue=%237ea1b9&clientId=u6f9030f0-d1e4-4&from=paste&height=97&id=u4a3ea4a3&originHeight=117&originWidth=1122&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=33911&status=done&style=none&taskId=u4e98684a-cb76-4a3b-a6d2-9424df91340&title=&width=934.9999628464395)
这里有两个实现类，默认第一个，封装连接请求，ConnectRequest，最后在封装成Packet对象，放入请求发送队列outgoingQueue中去。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711802122895-f7f9f327-8667-4506-87a9-815dc81acab0.png#averageHue=%23202125&clientId=u6f9030f0-d1e4-4&from=paste&height=714&id=ubb46c9f0&originHeight=857&originWidth=1103&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=114914&status=done&style=none&taskId=u3825014b-3f94-4717-845a-f1b95d16403&title=&width=919.1666301422664)
当客户端请求准备完毕后，就可以开始向服务端发送请求了。ClientCnxnSocket负责从outgoingQueue中取出一个待发送的Packet对象，将其序列化成ByteBuffer后，向服务端进行发送。
```java
 void sendPacket(Packet p) throws IOException {
        SocketChannel sock = (SocketChannel) sockKey.channel();
        if (sock == null) {
            throw new IOException("Socket is null!");
        }
        p.createBB();
        ByteBuffer pbb = p.bb;
        sock.write(pbb);
    }
```
### 1.2.2 eventThread

- 启动一个线程不断轮训事件，对不同的事件对出不同步的反应，processEvent方法是关键

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711802507675-a484e5d0-dd85-4cd9-8778-30eace35cd6b.png#averageHue=%231e1f23&clientId=u6f9030f0-d1e4-4&from=paste&height=514&id=u03d34c0b&originHeight=617&originWidth=992&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=58832&status=done&style=none&taskId=uf4b17d5c-9398-45ad-8ce5-dbd8cbb183d&title=&width=826.666633817886)
首先，方法通过instanceof关键字检查传入的事件对象是否是WatcherSetEventPair类型。如果是，这意味着事件包含了一组Watcher对象，每个Watcher都会处理这个事件。代码遍历这些Watcher对象，并调用它们的process方法来处理事件。如果在处理过程中抛出异常，将会记录错误日志。
如果事件对象不是WatcherSetEventPair类型，那么它将被当作Packet类型来处理。Packet对象包含了客户端路径、回复头信息以及回调接口（cb）。代码首先检查回复头中的错误码，如果有错误，就将错误码保存在局部变量rc中。
接下来，代码根据响应的类型（例如ExistsResponse、GetDataResponse等）来调用相应的回调接口方法。这些回调接口是Zookeeper客户端用来接收操作结果的机制。例如，如果响应是GetDataResponse类型，那么代码会调用DataCallback接口的processResult方法，并传入操作结果码、客户端路径、上下文信息、节点数据和状态信息。
此外，代码还处理了MultiResponse类型，这是一种特殊的情况，表示一个请求包含了多个操作，每个操作都有自己的结果。在这种情况下，代码会遍历结果列表，并在所有操作都成功的情况下调用MultiCallback接口的processResult方法。
最后，如果回调接口是VoidCallback类型，那么代码会调用processResult方法，但不会传入任何数据，因为VoidCallback不关心操作结果。
# 二 ZooKeeper会话的响应
## 2.1 接受服务端响应
ClientCnxnSocket接收到服务端的响应后，会首先判断当前的客户端状态是否是“已初始化”，如果尚未完成初始化，那么就认为该响应一定是会话创建请求的响应，直接交由readConnectResult方法来处理该响应。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711802915210-8bdfb5da-4924-4a36-9ae6-45f7d479f3a1.png#averageHue=%23202125&clientId=u6f9030f0-d1e4-4&from=paste&height=622&id=u063dcbb0&originHeight=746&originWidth=1125&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=110975&status=done&style=none&taskId=u7bdb6238-157a-4987-a4aa-a8734d9e2b9&title=&width=937.4999627470985)

- 反序列响应结果，使用Jute进行的

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711802951901-9a2248a6-9e15-4f99-ab33-1edf144a71c4.png#averageHue=%23202125&clientId=u6f9030f0-d1e4-4&from=paste&height=214&id=u76ab6f7d&originHeight=257&originWidth=1090&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=44691&status=done&style=none&taskId=ubf1f0f7d-7ced-4518-9bcf-bf1ed97d2b3&title=&width=908.333297239411)

- 连接成功后，一方面需要通知SendThread线程，进一步对客户端进行会话参数的设置，包括readTimeout和connectTimeout等，并更新客户端状态；另一方面，需要通知地址管理器HostProvider当前成功连接的服务器地址。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711803076749-71f43021-0470-4461-b1ea-40df0c92e139.png#averageHue=%231f2024&clientId=u8d3fb859-9375-4&from=paste&height=160&id=ubd1a19b2&originHeight=192&originWidth=964&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=19583&status=done&style=none&taskId=ub7c0e653-4255-486d-8883-9e1a70eb4a9&title=&width=803.333301411736)

- 为了能够让上层应用感知到会话的成功创建，SendThread会生成一个事件SyncConnected-None，代表客户端与服务器会话创建成功，并将该事件传递给EventThread线程。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711803161125-85fc6b63-dcd3-4b13-b505-de35628599d2.png#averageHue=%23202226&clientId=u8d3fb859-9375-4&from=paste&height=717&id=u7ffc7348&originHeight=861&originWidth=1060&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=149137&status=done&style=none&taskId=uc4a0d738-2631-4dda-a67c-611cb72e2a9&title=&width=883.3332982328217)
EventThread线程收到事件后，会从ClientWatchManager管理器中查询出对应的Watcher，针对SyncConnected-None事件，那么就直接找出步骤2中存储的默认Watcher，然后将其放到EventThread的waitingEvents队列中去。
EventThread不断地从waitingEvents队列中取出待处理的Watcher对象，然后直接调用该对象的process接口方法，以达到触发Watcher的目的。
# 三 ClientCnxn 详解
## 3.1 Packet
Packet是ClientCnxn内部定义的一个对协议层的封装，作为ZooKeeper中请求与响应的载体
![image.png](https://cdn.nlark.com/yuque/0/2024/png/12426173/1711807172921-8d374429-81d7-4063-bbef-bad43b47cf46.png#averageHue=%231e1f23&clientId=u8d3fb859-9375-4&from=paste&height=659&id=u01ad92eb&originHeight=791&originWidth=1035&originalType=binary&ratio=1.2000000476837158&rotation=0&showTitle=false&size=66022&status=done&style=none&taskId=u6cdb4b5e-1caf-40ef-98f0-c3235d00f0f&title=&width=862.4999657273306)
Packet中包含了最基本的请求头(requestHeader)、响应头(replyHeader)、请求体(request)、响应体(response)、节点路径(clientPath/serverPath)和注册的Watcher(watchRegistration)等信息。
Packet的createBB()方法负责对Packet对象进行序列化，最终生成可用于底层网络传输的ByteBuffer对象。在这个过程中，只会将requestHeader、request和readOnly三个属性进行序列化，其余属性都保存在客户端的上下文中，不会进行与服务端之间的网络传输。
```java
 public void createBB() {
            try {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                BinaryOutputArchive boa = BinaryOutputArchive.getArchive(baos);
                boa.writeInt(-1, "len"); // We'll fill this in later
                if (requestHeader != null) {
                    requestHeader.serialize(boa, "header");
                }
                if (request instanceof ConnectRequest) {
                    request.serialize(boa, "connect");
                    // append "am-I-allowed-to-be-readonly" flag
                    boa.writeBool(readOnly, "readOnly");
                } else if (request != null) {
                    request.serialize(boa, "request");
                }
                baos.close();
                this.bb = ByteBuffer.wrap(baos.toByteArray());
                this.bb.putInt(this.bb.capacity() - 4);
                this.bb.rewind();
            } catch (IOException e) {
                LOG.warn("Ignoring unexpected exception", e);
            }
        }
```
## 3.2 队列
outgoingQueue和pendingQueueClientCnxn中，有两个比较核心的队列outgoingQueue和pendingQueue，分别代表客户端的请求发送队列和服务端响应的等待队列。Outgoing队列是一个请求发送队列，专门用于存储那些需要发送到服务端的Packet集合。Pending队列是为了存储那些已经从客户端发送到服务端的，但是需要等待服务端响应的Packet集合。
## 3.3 ClientCnxnSocket：底层Socket通信层

- ClientCnxnSocket定义了底层Socket通信的接口。在ZooKeeper3.4.0以前的版本中，客户端的这个底层通信层并没有被独立出来，而是混合在了ClientCnxn代码中。
- 但后来为了使客户端代码结构更为清晰，同时也是为了便于对底层Socket层进行扩展（例如使用Netty来实现），因此从3.4.0版本开始，抽取出了这个接口类。在使用ZooKeeper客户端的时候，可以通过在zookeeper.clientCnxnSocket这个系统变量中配置ClientCnxnSocket实现类的全类名，以指定底层Socket通信层的自定义实现，例如，-Dzookeeper.clientCnxnSocket=org.apache.zookeeper.ClientCnxnSocketNIO。在ZooKeeper中，其默认的实现是ClientCnxnSocketNIO。该实现类使用Java原生的NIO接口，其核心是doIO逻辑，主要负责对请求的发送和响应接收过程。



