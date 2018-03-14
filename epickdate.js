require('../jquery.simple-dtpicker');
require('../../css/jquery.simple-dtpicker');
require('../service/api')
require('../app.module').directive('ePickdate', ['$timeout','Api', function($timeout,Api) { 
    return {        
        restrict: "A",
       /* scope: {            
            select_date: '=',
            pickADateOptions: '='        
        },*/
        link: function(scope, element, attrs) {
           
           /* "current": null,
            "dateFormat": "default",
            "locale": "en",
            "animation": true,
            "minuteInterval": 30,
            "firstDayOfWeek": 0,
            "closeOnSelected": false,
            "timelistScroll": true,
            "calendarMouseScroll": true,
            "todayButton": true,
            "dateOnly": false,
            "futureOnly": false,
            "minDate" : null,
            "maxDate" : null,
            "autodateOnStart": true,
            "minTime":"00:00",
            "maxTime":"23:59",
            "onShow": null,
            "onHide": null,
            "allowWdays": null*/
              var zpadding = function(num) {
                num = ("0" + num).slice(-2);
                return num;
            };
            function getLastDay(year, month) {
              var new_year = year; //取当前的年份
              var new_month = month++; //取下一个月的第一天，方便计算（最后一天不固定）
              if (month > 12) {
                new_month -= 12; //月份减
                new_year++; //年份增
              }
              var new_date = new Date(new_year, new_month, 1); //取当年当月中的第一天
              return (new Date(new_date.getTime() - 1000 * 60 * 60 * 24)).getDate(); //获取当月最后一天日期
            }
            var nowdate=new Date(2017,8);
            if(nowdate.getMonth()==2){
                nowdate=new Date(2017,2,1)
            }
            var historyMouth;
            var nowday=new Date(2017,8);
            var nowYear=nowday.getFullYear();
            var nowMouth=nowday.getMonth()
            var config={
               "locale":"cn", 
               "allowWdays": [1, 2, 3, 4, 5,6,0],
               "minDate":nowdate,
               //"maxDate":new Date(2017,nowMouth,getLastDay(nowYear,nowMouth+1)),
               "maxDate":new Date(2017,8),
               "futureOnly":false,
               "dateOnly": true,
               "autodateOnStart":false,
               "current": new Date(2017,8),
               "callback":function(year,mouth,day,days){
                var date=year+'-'+zpadding(mouth+1)+"-"+zpadding(day);
                var month=year+'-'+zpadding(mouth+1)

                $timeout(function(){
                    if(mouth==2&&year==2017){
                        //console.log("past")
                            scope.pageCtrls.select_date = null;
                            scope.pageCtrls.select_days = null;
                            scope.pageCtrls.select_time = null;
                            scope.pageCtrls.select_time_err = '请选择日期时间';
                             scope.update_days("clear");
                        return
                    }
                    scope.pageCtrls.select_date=date;
                    scope.pageCtrls.select_time=null;
                    scope.pageCtrls.select_days=days;
                    scope.pageCtrls.select_time_err='请选择日期时间';
                    scope.update_days();
                    setTimeout(function(){
                       var tdList=  element.handleDtpicker('getTD')
                      // console.log(tdList)
                       Api.statics(month).then(function(res){
                        if(res.data.code==1){
                           // historyMouth=mouth;
                           // console.log(res.data.data.full)
                            var full_data=res.data.data.full;
                            for(var i in full_data)
                            {
                               
                                if(full_data[i]==1){
                                    //console.log(i,tdList[i])
                                    if(tdList[i]){
                                        tdList[i].addClass("full")  
                                    }
                                   //
                                }
                               // console.log(full_data[i])
                            }
                        }

                       })
                      // console.log(tdList)
                    },0)
                })
               // console.log("..."+date)
               }
            }
          var t= element.dtpicker(config)
          //element.handleDtpicker('setDate',new Date(2017, 2, 1, 0, 0, 0))
          //console.log(t)
          element.one('$destroy', function() {
                
                if (t) element.handleDtpicker('destroy');
            });
          //t.handleDtpicker('getDate');;
          
        }    
    };

}]);

var IScroll=require('iscroll');
require('../app.module').directive('ePicktime', ['$timeout', function($timeout) { 
    return {        
        restrict: "A",
        
        link: function(scope, element, attrs) {
            var zpadding = function(num) {
                num = ("0" + num).slice(-2);
                return num;
            };
            /*var week_time={
                weekend:['11:00-13:00','16:00-18:00','20:00-22:00'],
                normal:['12:00-14:00','20:00-22:00']
            };*/
            var week_time={
                normal:[
                  '12:00-12:30',
                  '12:30-13:00',
                  '13:00-13:30',
                  '13:30-14:00',
                  '20:00-20:30',
                  '20:30-21:00',
                  '21:00-21:30',
                  '21:30-22:00'
                ],
                weekend:[
                  '11:00-11:30',
                  '11:30-12:00',
                  '12:00-12:30',
                  '12:30-13:00',
                  '16:00-16:30',
                  '16:30-17:00',
                  '17:00-17:30',
                  '17:30-18:00',
                  '20:00-20:30',
                  '20:30-21:00',
                  '21:00-21:30',
                  '21:30-22:00'
                ]
            }
            var overview=element.find(".overview")
              var thumb=element.find(".thumb")
            var minuteInterval=30;
            var timelist=["1"]
            var startTime=9;
            var endTime=18;
            var min_=0;
            var hour_=startTime;
            var firstStr
            var selectItem=null;
            var width=0;
            scope.update_days=function(clear){
                if(clear=="clear"){
                   // console.log("here")
                    overview.empty();
                    timeleft.hide()
                    timeright.hide()
                    return
                }
                width=0;
                if(scope.pageCtrls.select_days==0||scope.pageCtrls.select_days==6){
                    dayChangeTime('weekend')
                }else{
                    dayChangeTime('normal')
                }
                timeleft.show()
                timeright.show()
            }
            function dayChangeTime(type){
               // console.log(type)
                overview.empty();
                var list=week_time[type]
                //console.log(list)
                for(var i=0;i<list.length;i++){
                    var $o = $('<div>');
                    $o.addClass("timelist_item")
                   
                    $o.bind("click touchstart", function(e) {
                       // console.log("??")
                       // e.stopPropagation();

                        if (selectItem) {
                            selectItem.removeClass('hover');
                            selectItem.removeClass('active');
                        }
                        selectItem = $(this)

                        if (selectItem.hasClass('hover')) {
                            selectItem.removeClass('hover');
                        }
                        selectItem.addClass('active');
                        $timeout(function() {
                            scope.pageCtrls.select_time = selectItem.text();
                            scope.pageCtrls.select_time_err = false;
                        })
                            //console.log(selectItem.text())

                    });
                    $o.text(list[i]);
                      width+=135;
                   
                    overview.append($o);
                   
                     //console.log($o.width())
                }
            
               
              
                overview.css("width", width)
                  // overview.append('<div class="af-module hit-area"></div>');
                //scrollbar5.update("relative");
            
                
                
              
                myScroll.scrollTo(0,0);
                myScroll.refresh();
                //maxW = 355 * scrollbar5.trackRatio;
            }
             var timeleft=element.parent().find(".time-left")
            //timeleft.hide()
            var timeright=element.parent().find(".time-right")
          //  timeright.hide()
          //console.log(element.find(".viewport").get(0))
            var   myScroll = new IScroll(element.find(".viewport").get(0), {
                scrollX: true,
                scrollY: true,
                momentum:true,
                preventDefault:true,
                snap: true,
                 tap:true
               /* preventDefault:false,
                 snap: true,
                 tap:true*/
                // snap: 'div'

            });
             timeleft.bind("click",function(){
                 myScroll.refresh();
               myScroll.next()
               
            })
           

             timeright.bind("click",function(){
                 myScroll.refresh();
                 myScroll.prev()
                
            })
            /*element.tinyscrollbar({ axis: "x",thumbSize:25});
            var scrollbar5 = element.data("plugin_tinyscrollbar")
            var thumb=element.find(".thumb")
          

           
            var n=parseInt(thumb.css("left"));
            var step=45;
            var maxW=355*scrollbar5.trackRatio;
           
            timeleft.bind("click",function(){
                
                 n-=step
                 n=Math.max(0,n)
                 scrollbar5.update(n);
               
            })
            scrollbar5.setbackData(setData)
            function setData(data){
                n=data*scrollbar5.trackRatio;
            }

             timeright.bind("click",function(){
                
                n+=step
                n=Math.min(n,maxW)
                 scrollbar5.update(n);
                
            })
             */
            element.one('$destroy', function() {
               // timeleft=timeright=null;
                myScroll.destroy();
                myScroll = null;
                
            });
        }    
    };

}]);
