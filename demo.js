//静态变量
var clientW = document.documentElement.clientWidth;
var clientH = document.documentElement.clientHeight;
var winWidth  = (clientW > 0) ? clientW : $(window).width();
var winHeight  = (clientH > 0) ? clientH : $(window).height();
var mainWidth = parseInt(winWidth*0.9);
var margin = 2; //方块间距
var maxRowNum = 8; //每行方块个数最大值
var initRowNum = 4; //初始时每行方块个数
var initLevel = 1; //游戏难度系数(0 1 2)，默认1(一般)
var initModel = 0; //设置初始时游戏模式(0-地狱模式，1-通关模式)
var initTime = 25; //普通模式初始时间
var initColorGrad = 30; //初始时颜色变化的梯度范围，此处不要更改
var successTime = 10; //成功后增加10
var errorTime = -5; //失败后减少5
var timer; //计时器

//动态变量
var rowNum = initRowNum; //用于累计每行方块个数
var nowLoc; //记录当前突出方块的位置
var level = initLevel;
var score = 0;  //记录分数
var model = initModel; //记录当前游戏模式
var nowTime = initTime; //记录当前时间值
var isTimeBegin = 1; //计时是否开始
var colorGrad = initColorGrad; //颜色变化的梯度范围
var addTime = 0; //过关后奖励的时间

//定义游戏容器宽高
$('#main-container').css({
  width: mainWidth,	
  height: mainWidth
});
$('#passScreen').css({
  width: mainWidth,	
  height: mainWidth
});
//定义弹出层宽高
$('#winScreen').css({
  width: winWidth,	
  height: winHeight
});
//给按钮居中显示
$('#diff').css('paddingLeft', parseInt((winWidth*0.9 - $('#diff button').eq(0).width()*3)/2));
$('.model-container').css('paddingLeft', parseInt((winWidth*0.95 - $('#restart').width()*2)/2));

//帮助
$('#help').tap(function(){
	stopTime(); //暂停
  $('#game-area li').removeClass();
  $('#moreInfo').css('display', 'block');	
});
$('#return').tap(function(){
  if(isTimeBegin == 0)
	  showTime(); //开始
  $('#moreInfo').css('display', 'none');	
});
//定义帮助弹出层宽高
$('#moreInfo').css({
  width: winWidth,	
  height: winHeight
});

//游戏初始化
driveRect(); 

//重新开始
$('#restart').tap(function(){
	$('#winScreen .text').html('游戏结束!');
  restart();
});
//gameover后重新开始
$('#winScreen button').tap(function(){
	$('#winScreen').hide();
	restart();
});

//难度选择
$('#diff').delegate('button', 'tap', function(){
	var id = $(this).index();
	if(level != id){
		$('#diff button').eq(level).removeClass('btn-active');
	  $(this).addClass('btn-active');	
	  level = id;
	}
	restart();
});	

//游戏模式切换
$('#model').tap(function(){
  if(model == 1){
  	model = 0;
  	$(this).html('无尽模式');
  }else{
  	model = 1;
  	$(this).html('通关模式');
  }
  restart();
});

//执行游戏
$('#game-area').delegate('li', 'tap', function(){
	//第一次点击触发计时器
  if(isTimeBegin == 1){
	  isTimeBegin = 0;
	  showTime();
  }
  //判断是否点击正确
  if($(this).attr('data-id') == nowLoc){
  	if(model == 0){
	    score += level+1;
	  }else{
	    score += (initColorGrad - colorGrad)*(level+1);
	  }
	  $('#scoreNum').html(score);
	  //颜色梯度范围为0时通关
	  if(colorGrad == 0){
	    $('#winScreen .text').html('恭喜通关!');
  	  finished();	
	  }else{
	  	if(colorGrad%10==0 && colorGrad<initColorGrad){
	  		//为关数增加动画样式
	  		$('#passScreen').css('display', 'block');
	  		stopTime();
	  		$('#passScreen').tap(function(){
	  			$('#passScreen').css('display', 'none');
	        showTime();	
	  		});
	  		//显示关数
	  		if(colorGrad/10 == 3){
	  			$('#pass span').html(1);
	  		}
	  		if(colorGrad/10 == 2){
	  			$('#pass span').html(2);
	  		}
	  		if(colorGrad/10 == 1){
	  		  $('#pass span').html(3);
	  		}
	  	  switch(level){
	  	    case 0: addTime += 15; break;
	  	    case 1: addTime += 10; break;
	  	    case 2:	addTime += 5;
	  	  }
	  	}
	  	nowTime = ((nowTime+successTime) > (initTime+addTime)) ? (initTime+addTime) : (nowTime+successTime);
      driveRect();
    }
  }else{
  	nowTime = ((nowTime+errorTime) < 0) ? 0 : (nowTime+errorTime);
  	//添加抖动样式
  	$('#game-area li').addClass('shake');
  	setTimeout(function(){
  		$('#game-area li').removeClass();
  	}, 500);
  }
});

//画方块
function driveRect(){
  var total = Math.pow(rowNum,2); //方块总数
  var rectWidth = Math.floor((mainWidth - margin*(rowNum+1))/rowNum); //方块宽度
  var leaveMargin = Math.floor((mainWidth - rectWidth*rowNum - margin*(rowNum+1))/2); //多余宽度
  var arrColor = getRandomColor(); //获取随机颜色数组
  var html = ''; //存放用于显示小方块的html代码
  var temp = parseInt(Math.random()*total);
  nowLoc = (temp > 0) ? temp : 1; //突出方块位置
  $('#game-area').css({
    paddingLeft: leaveMargin,
    paddingTop: leaveMargin
  });
  for(var i=1;i<=total;i++){
  	var color = arrColor[0];
  	if(i == nowLoc) color = arrColor[1];
    html += '<li data-id="'+i+'" class="animated zoomIn" style="width:'+rectWidth+'px;height:'+rectWidth+'px;background-color:'+color+';margin-left:'+margin+'px;margin-top:'+margin+'px;"><li>';	
  }	
  
	if(rowNum < maxRowNum)
	  rowNum++; //每行方块数+1
  
  $('#game-area').html(html);
  setTimeout(function(){
  	$('#game-area li').removeClass();
  }, 500);
};
//计时模式时间变化
function showTime(){
  timer = setInterval(function(){
    if(nowTime > 0){
    	nowTime--;
    	$('#timeNum').html(nowTime);
    	$('#scoreNum').html(score);
    }else{
      $('#winScreen .text').html('游戏结束!');
      finished();
    }
  }, 1000);	
};
//计时归零
function clearTime(){
  clearInterval(timer);
  nowTime = 0;
  $('#timeNum').html(nowTime);
};
//计时暂停
function stopTime(){
  clearInterval(timer);
  $('#timeNum').html(nowTime);
};
//重新开始
function restart(){
	clearInterval(timer);
	colorGrad = initColorGrad;
	addTime = 0;
	rowNum = initRowNum;
  nowLoc = parseInt(Math.random()*Math.pow(rowNum, 2));
  score = 0;
  isTimeBegin = 1;
  nowTime = initTime;
  $('#scoreNum').html(0);
  $('#timeNum').html(nowTime);
  driveRect();
};
//游戏结束
function finished(){
  clearInterval(timer);
  $('#game-area li').removeClass();
  var modelText, levelText;
  if(model == 0)
    modelText = '无尽模式';
  else
  	modelText = '通关模式';
  if(level == 0)
    levelText = '简单';
  if(level == 1)
    levelText = '一般';
  if(level == 2)
    levelText = '困难';
  $('.score p').eq(0).html(modelText);
  $('.score p').eq(1).html(levelText);
  $('.score p span').html(score);
  $('#winScreen').show();	
};
//随机颜色
function getRandomColor(){
	//主体颜色数值
	var rgb1 = getBetweenNum(55, 200);
	var rgb2 = getBetweenNum(55, 200);
	var rgb3 = getBetweenNum(55, 200);
	//定义颜色范围的绝对值
	var sim = (Math.random() > 0.5) ? 30 : -30;
	var gen = (Math.random() > 0.5) ? 20 : -20;
	var dif = (Math.random() > 0.5) ? 10 : -10;
	var pass = (Math.random() > 0.5) ? colorGrad : -colorGrad;
	//相似颜色
	var similarColor;
	//判断游戏级别
	if(model == 0){
		switch(level){
		  case 0:
		    similarColor = 'rgb('+(rgb1+sim)+','+(rgb2+sim)+','+(rgb3+sim)+')';
		    break;
		  case 1:
		    similarColor = 'rgb('+(rgb1+gen)+','+(rgb2+gen)+','+(rgb3+gen)+')';
		    break;
		  case 2:
		    similarColor = 'rgb('+(rgb1+dif)+','+(rgb2+dif)+','+(rgb3+dif)+')';	
		}
	}else{
		similarColor = 'rgb('+(rgb1+pass)+','+(rgb2+pass)+','+(rgb3+pass)+')';
		colorGrad--;
	}
	
  return ['rgb('+rgb1+','+rgb2+','+rgb3+')', similarColor];
};
//获取两个数之间的随机数
function getBetweenNum(min, max){
  return parseInt(min + Math.random()*(max-min));	
};