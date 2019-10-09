<%@page import="cn.com.do1.component.uploadfile.imageupload.model.TbFileMediaPO"%>
<%@page import="cn.com.do1.component.addressbook.contact.vo.UserOrgVO"%>
<%@page import="cn.com.do1.component.addressbook.contact.service.IContactService"%>
<%@page import="cn.com.do1.dqdp.core.DqdpAppContext"%>
<%@page import="cn.com.do1.component.systemmgr.user.model.User"%>
<%@page import="org.apache.commons.httpclient.methods.multipart.Part"%>
<%@page import="net.sf.json.JSONObject"%>
<%@page import="cn.com.do1.common.util.AssertUtil"%>
<%@page import="org.apache.commons.httpclient.HttpStatus"%>
<%@page import="org.apache.commons.httpclient.HttpClient"%>
<%@page import="org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity"%>
<%@page import="org.apache.commons.httpclient.methods.multipart.StringPart"%>
<%@page import="org.apache.commons.httpclient.methods.multipart.FilePart"%>
<%@page import="org.apache.commons.httpclient.params.HttpMethodParams"%>
<%@page import="org.apache.commons.httpclient.methods.PostMethod"%>
<%@page import="cn.com.do1.component.util.Configuration"%>
<%@page import="org.apache.struts2.dispatcher.multipart.MultiPartRequestWrapper"%>
<%@page import="org.apache.commons.fileupload.util.Streams"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.*,java.io.*" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="org.apache.commons.fileupload.*" %>
<%@ page import="org.apache.commons.fileupload.disk.*" %>
<%@ page import="org.apache.commons.fileupload.servlet.*" %>
<%@ page import="org.json.simple.*" %>
<%@ page import="cn.com.do1.component.util.HttpUploadFileUtil" %>
<%
IContactService contactService = DqdpAppContext.getSpringContext().getBean("contactService", IContactService.class);
/**
 * KindEditor JSP
 * 
 * 本JSP程序是演示程序，建议不要直接在实际项目中使用。
 * 如果您确定直接使用本程序，使用之前请仔细确认相关安全设置。
 * 
 */
User user = (User) DqdpAppContext.getCurrentUser();
if(user==null){
	out.println(getError("页面已过期，请重新登录。"));
	return;
}
UserOrgVO org =  contactService.getOrgByUserId(user.getUsername());
if(org == null){
	out.println(getError("页面已过期，请重新登录。"));
	return;
}
String orgId = org.getOrgId();
//文件保存目录路径
String savePath = pageContext.getServletContext().getRealPath("/") + "attached/";

//文件保存目录URL
String saveUrl  = "/attached/";

File tmpDir = new File(savePath+"temp"); //初始化上传文件的临时存放目录,必须是绝对路径 

//定义允许上传的文件扩展名
HashMap<String, String> extMap = new HashMap<String, String>();
extMap.put("image", "gif,jpg,jpeg,png,bmp");
extMap.put("flash", "swf,flv");
extMap.put("media", "swf,flv,mp3,wav,wma,wmv,mid,avi,mpg,asf,rm,rmvb");
extMap.put("file", "doc,docx,xls,xlsx,ppt,htm,html,txt,zip,rar,gz,bz2");

//最大文件大小
long maxSize = 5 * 1024 * 1024;

response.setContentType("text/html; charset=UTF-8");

if(!ServletFileUpload.isMultipartContent(request)){
	out.println(getError("请选择文件。"));
	return;
}

String dirName = request.getParameter("dir");
if (dirName == null) {
	dirName = "image";
}
if(!extMap.containsKey(dirName)){
	out.println(getError("目录名不正确。"));
	return;
}
//检查目录
/* File uploadDir = new File(savePath);
if(!uploadDir.isDirectory()){
	uploadDir.mkdir();
	//out.println(getError("上传目录不存在。"));
	//return;
}
//检查目录写权限
if(!uploadDir.canWrite()){
	out.println(getError("上传目录没有写权限。"));
	return;
}

String dirName = request.getParameter("dir");
if (dirName == null) {
	dirName = "image";
}
if(!extMap.containsKey(dirName)){
	out.println(getError("目录名不正确。"));
	return;
}
//创建文件夹
savePath += dirName + "/";
saveUrl += dirName + "/";
File saveDirFile = new File(savePath);
if (!saveDirFile.exists()) {
	saveDirFile.mkdirs();
}
SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
String ymd = sdf.format(new Date());
savePath += ymd + "/";
saveUrl += ymd + "/";
File dirFile = new File(savePath);
if (!dirFile.exists()) {
	dirFile.mkdirs();
} */
DiskFileItemFactory factory = new DiskFileItemFactory();   
//指定在内存中缓存数据大小,单位为byte,这里设为1Mb    
factory.setSizeThreshold(1 * 1024 * 1024);    
//设置一旦文件大小超过getSizeThreshold()的值时数据存放在硬盘的目录    
factory.setRepository(tmpDir);    
ServletFileUpload sfu = new ServletFileUpload(factory);   
 // 指定单个上传文件的最大尺寸,单位:字节，这里设为5Mb    
sfu.setFileSizeMax(5 * 1024 * 1024);   
//指定一次上传多个文件的总尺寸,单位:字节，这里设为10Mb    
sfu.setSizeMax(10 * 1024 * 1024);    
sfu.setHeaderEncoding("UTF-8"); //设置编码，因为我的jsp页面的编码是utf-8的    
FileItemIterator fii = sfu.getItemIterator(request);// 解析request请求



//Struts2 请求 包装过滤器    
MultiPartRequestWrapper wrapper = (MultiPartRequestWrapper) request;    
//获得上传的文件名    
String[] imgfileNames = wrapper.getFileNames("imgFile");//imgFile,imgFile,imgFile    
//获得文件过滤器    
File[] imgfiles = wrapper.getFiles("imgFile");
int fileSize = imgfiles.length;
File imgfile;
String imgfileName;
for(int i=0; i<fileSize;i++){
	imgfile = imgfiles[i];
	//检查文件大小
	if(imgfile.length() > maxSize){
		out.println(getError("上传文件大小超过限制。"));
		return;
	}
	imgfileName = imgfileNames[i];
	//检查扩展名
	String fileExt = imgfileName.substring(imgfileName.lastIndexOf(".") + 1).toLowerCase();
	if(!Arrays.<String>asList(extMap.get(dirName).split(",")).contains(fileExt)){
		out.println(getError("上传文件扩展名是不允许的扩展名。\n只允许" + extMap.get(dirName) + "格式。"));
		return;
	}
	String returnStr ="";
	PostMethod postMethod = new PostMethod(HttpUploadFileUtil.getFileServerUrl()+"!doUploadImage.action");
    String newFileName = UUID.randomUUID().toString().replace("-", "").toLowerCase();
    try {
    	postMethod.getParams().setParameter(HttpMethodParams.HTTP_CONTENT_CHARSET,"utf-8");  
    	//FilePart：用来上传文件的类
    	FilePart fp = new FilePart("file", imgfile);
    	Part[] parts = {new StringPart("fileFileType", fileExt),new StringPart("orgId", orgId.replace("-", ""))
		,new StringPart("type", "image"),new StringPart("newFileName", newFileName), fp};

    	//对于MIME类型的请求，httpclient建议全用MulitPartRequestEntity进行包装
    	MultipartRequestEntity mre = new MultipartRequestEntity(parts, postMethod.getParams());
    	postMethod.setRequestEntity(mre);
    	HttpClient client = new HttpClient();
    	client.getHttpConnectionManager().getParams().setConnectionTimeout(50000);// 设置连接时间
    	int status = client.executeMethod(postMethod);
    	if (status == HttpStatus.SC_OK) {
    		String returnJson = postMethod.getResponseBodyAsString();
    		if(!AssertUtil.isEmpty(returnJson)){
        		JSONObject toClientJson = JSONObject.fromObject(returnJson);
        		String codeString = toClientJson.getString("code");
        		//上传成功
        		if("0".equals(codeString)){
        			returnStr = toClientJson.getString("url");

					TbFileMediaPO media = new TbFileMediaPO();
					media.setId(newFileName);
					media.setOrgId(org.getOrgId());
					media.setType("image");
					media.setSourceType(1);
					media.setUrl(returnStr);
					media.setFileSize(imgfile.length());
					media.setFileName(imgfileName);
					media.setCreatePerson(user.getUsername());
					media.setCreateTime(new Date());
					media.setStatus(0);
					contactService.insertPO(media, false);
        		}
        		else{
        			out.println(getError("上传文件失败。"));
        			return;
        		}
    		}
    	} else {
			out.println(getError("上传文件失败。"));
			return;
    	}
    } catch (Exception e) {
		out.println(getError("上传文件失败。"));
		return;
    } finally {
        //释放连接
        postMethod.releaseConnection();
    }
    //是否开启备份（备份到本地文件夹）
	if(Configuration.IS_OPEN_BACKUP){
		PostMethod postMethod2;	
		postMethod2= new PostMethod(Configuration.BAK_UPLOAD_FILE_URL+"!doUploadImage.action");
		try {
			postMethod2.getParams().setParameter(HttpMethodParams.HTTP_CONTENT_CHARSET,"utf-8");  
			//FilePart：用来上传文件的类
			FilePart fp = new FilePart("file", imgfile);
			Part[] parts = {new StringPart("fileFileType", fileExt),new StringPart("orgId", orgId.replace("-", ""))
			,new StringPart("type", "image"),new StringPart("newFileName", newFileName), fp};

			FilePart fp2 = new FilePart("file", imgfile);
	    	Part[] parts2 = {new StringPart("fileFileType", fileExt),new StringPart("orgId", orgId.replace("-", ""))
			,new StringPart("type", "image"),new StringPart("newFileName", newFileName), fp2};

	    	
			//对于MIME类型的请求，httpclient建议全用MulitPartRequestEntity进行包装
			MultipartRequestEntity mre = new MultipartRequestEntity(parts2, postMethod2.getParams());
			postMethod2.setRequestEntity(mre);
			HttpClient client = new HttpClient();
			client.getHttpConnectionManager().getParams().setConnectionTimeout(20000);// 设置连接时间
			client.getHttpConnectionManager().getParams().setSoTimeout(180000);// 读取数据超时时间
			client.executeMethod(postMethod2);
			
		} catch (Exception e) {
		} finally {
			//释放连接
			if(postMethod2!=null)
				postMethod2.releaseConnection();
		}
	}
	/* try{
 		SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
 		newFileName = df.format(new Date()) + "_" + new Random().nextInt(1000) + "." + fileExt;
 	
    	BufferedInputStream in = new BufferedInputStream(new FileInputStream(imgfile));    
    	BufferedOutputStream bufferedout = new BufferedOutputStream(new FileOutputStream(new File(savePath + newFileName)));   
    	Streams.copy(in, bufferedout, true); // 开始把文件写到你指定的上传文件夹
	}catch(Exception e){
		out.println(getError("上传文件失败。"));
		return;
	} */
	JSONObject obj = new JSONObject();
	obj.put("error", 0);
	obj.put("url", Configuration.COMPRESS_URL+returnStr);
	//obj.put("url", Configuration.LOCAL_PORT+"/compress"+returnStr);
	out.println(obj.toString());
}
//FileItemFactory factory = new DiskFileItemFactory();
//ServletFileUpload upload = new ServletFileUpload(factory);
//upload.setHeaderEncoding("UTF-8");
//List items = upload.parseRequest(request);
//Iterator itr = items.iterator();
//while (itr.hasNext()) {
/**while (fii.hasNext()) {
	FileItemStream fis = fii.next();// 从集合中获得一个文件流
	if (!fis.isFormField() && fis.getName().length() > 0) {// 过滤掉表单中非文件域
		String fileExt = fis.getName().substring(fis.getName().lastIndexOf("."));// 获得上传文件的文件名    
		if(!Arrays.<String>asList(extMap.get(dirName).split(",")).contains(fileExt)){
			out.println(getError("上传文件扩展名是不允许的扩展名。\n只允许" + extMap.get(dirName) + "格式。"));
			return;
		}
	 	SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
	 	String newFileName = df.format(new Date()) + "_" + new Random().nextInt(1000) + "." + fileExt;
	 	
        BufferedInputStream in = new BufferedInputStream(fis.openStream());    
        BufferedOutputStream bufferedout = new BufferedOutputStream(new FileOutputStream(new File(savePath + newFileName)));   
        Streams.copy(in, bufferedout, true); // 开始把文件写到你指定的上传文件夹    

 		JSONObject obj = new JSONObject();
 		obj.put("error", 0);
 		obj.put("url", saveUrl + newFileName);
 		out.println(obj.toJSONString());
	}
	//FileItem item = (FileItem) itr.next();
	String fileName = item.getName();
	long fileSize = item.getSize();
	if (!item.isFormField()) {
		//检查文件大小
		if(item.getSize() > maxSize){
			out.println(getError("上传文件大小超过限制。"));
			return;
		}
		//检查扩展名
		String fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
		if(!Arrays.<String>asList(extMap.get(dirName).split(",")).contains(fileExt)){
			out.println(getError("上传文件扩展名是不允许的扩展名。\n只允许" + extMap.get(dirName) + "格式。"));
			return;
		}

		SimpleDateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
		String newFileName = df.format(new Date()) + "_" + new Random().nextInt(1000) + "." + fileExt;
		try{
			File uploadedFile = new File(savePath, newFileName);
			item.write(uploadedFile);
		}catch(Exception e){
			out.println(getError("上传文件失败。"));
			return;
		}

		JSONObject obj = new JSONObject();
		obj.put("error", 0);
		obj.put("url", saveUrl + newFileName);
		out.println(obj.toJSONString());
	}
}*/
%>
<%!
private String getError(String message) {
	JSONObject obj = new JSONObject();
	obj.put("error", 1);
	obj.put("message", message);
	return obj.toString();
}
%>