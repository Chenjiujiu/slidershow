/*
@Version  v1.0
@Author   苦行僧|2021/12/23
*/


class SliderShow extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector(".slider-box");
    this.sliderArr = this.querySelectorAll(".slider-item");
    this.dot = this.querySelector(".dot-box");
    this.dotArr = this.querySelectorAll(".dot-item");
    this.prevButton = this.querySelector('.button-prev');
    this.nextButton = this.querySelector('.button-next');
    this.fps=this.dataset.time;
    this.width=this.slider.offsetWidth;
    this.length = this.sliderArr.length;
    this.current=0;

    this.currentPercent=0;
    this.isMove=false;
    this.moveTimer=null;
    this.autoTimer=null;
    this.delayTimer=null;
    this.init();
  }
  init(){
    this.bind();
    this.sliderArr[0].classList.add('slider-active');
    this.dotArr[0].classList.add('slider-active');
  }
  bind(){
    this.bindMouse();
    this.bindTouch();
    this.bindButton();
    this.bindPlay();
  }
  bindMouse(){
    let startX=0;
    let downX=0
    let endX=0;
    let movePercent=0;
    let downTime=0;
    let upTime=0;
    this.slider.onmousedown= (e)=>{
      e.preventDefault()
      startX=e.clientX;
      downX=startX;
      endX=startX;
      this.clearMove();
      this.stopPlay();
      this.clearDelay()
      downTime=new Date().getTime();
      document.onmousemove=(e)=>{
        e.preventDefault()
        this.isMove=true;
        endX=e.clientX;
        movePercent=(100*(endX-startX)/this.width);
        this.drag(movePercent)
        startX=endX;
      }
      document.onmouseup=(e)=>{
        upTime=new Date().getTime();
        if(upTime-downTime<200){
          if(endX-downX>5){
            this.prev();
          }else if(endX-downX<-5){
            this.next();
          }
        }else{
          this.dragEnd();
        }
        this.delayPlay()
        document.onmousemove=null;
        document.onmouseup=null;
      }
    }
    this.slider.querySelectorAll('a').forEach((item)=>{
      item.addEventListener('click',(e)=>{
        if(this.isMove){
          e.preventDefault()
          this.isMove=false;
        }
      })
    })
  }
  bindTouch(){
    let startX=0;
    let downX=0
    let endX=0;
    let movePercent=0;
    let downTime=0;
    let upTime=0;
    this.slider.ontouchstart=(e)=>{
      e.preventDefault()
      startX = e.changedTouches[0].pageX;
      downX=startX;
      endX=startX;
      this.clearMove();
      this.stopPlay();
      this.clearDelay()
      downTime=new Date().getTime();
      this.slider.ontouchmove=(e)=> {
        e.preventDefault()
        this.isMove=true;
        endX=e.changedTouches[0].pageX;
        movePercent=(100*(endX-startX)/this.width);
        this.drag(movePercent)
        startX=endX;
      }
      this.slider.ontouchend=(e)=> {
        upTime=new Date().getTime();
        if(upTime-downTime<200){
          if(endX-downX>5){
            this.prev();
          }else if(endX-downX<-5){
            this.next();
          }
        }else{
          this.dragEnd();
        }
        this.delayPlay()
        this.slider.onmousemove=null;
        this.slider.onmouseup=null;
      }
    }
  }
  bindButton(){
    if ( this.nextButton ){
      this.nextButton.onclick=()=>{
        this.stopPlay();
        this.clearDelay()
        this.next();
        this.delayPlay()
      }
    }
    if ( this.prevButton ) {
      this.prevButton.onclick=()=>{
        this.stopPlay();
        this.clearDelay()
        this.prev();
        this.delayPlay()
      }
    }
    if ( this.dotArr.length ){
      this.dotArr.forEach((item,index)=>{
        item.addEventListener('click',(e)=>{
          this.clearMove();
          this.stopPlay();
          this.clearDelay()
          console.log(index)
          let end=-index*100;
          this.move(this.currentPercent,end)
          this.delayPlay()
        })
      })
    }
  }
  bindPlay(){
    this.autoPlay();
    this.slider.addEventListener("mouseenter",()=>{

    })
    this.slider.addEventListener("mouseleave",()=>{

    })
  }
  setMovePercent(movePercent){
    this.currentPercent+=movePercent;
    this.setCurrentPercent()
    this.setItem();
    this.slider.style.transform="translate3D("+this.currentPercent+"%,0px,0px)"
  }
  setCurrentPercent(){
    if(this.currentPercent>=50){
      this.currentPercent=-this.length*100+50+(this.currentPercent-50);
    }else if((this.currentPercent<=(-(this.length-1)*100-50))){
      this.currentPercent=50+(this.currentPercent-(-(this.length-1)*100-50));
    }
    this.slider.style.transform="translate3D("+this.currentPercent+"%,0px,0px)"
  }
  setItem(){
    if(this.currentPercent>0){
      this.sliderArr[(this.length-1)].style.left="-100%";
    }else{
      this.sliderArr[(this.length-1)].style.left=(this.length-1)*100+"%";
    }
    if(this.currentPercent<-((this.length-1)*100)){
      this.sliderArr[0].style.left=this.length*100+"%";
    }else{
      this.sliderArr[0].style.left="0%";
    }
  }
  setActive(){
    this.current=Math.abs(Math.round(this.currentPercent/100));
    this.sliderArr.forEach((item)=>{item.classList.remove('slider-active')});
    this.sliderArr[this.current].classList.add('slider-active');
    this.dotArr.forEach((item)=>{item.classList.remove('slider-active')});
    this.dotArr[this.current].classList.add('slider-active');
  }
  next(){
    this.clearMove()
    let end=Math.round(this.currentPercent/100)*100-100;
    this.move(this.currentPercent,end)
  }
  prev(){
    this.clearMove()
    let end=Math.round(this.currentPercent/100)*100+100;
    this.move(this.currentPercent,end)
  }
  drag(movePercent){
    this.setMovePercent(movePercent)
    this.setItem();
  }
  move(sta,end){
    let step=0;
    this.moveTimer=setInterval(()=>{
      if(Math.abs(end-sta)>=1){
        step=(end-sta)/10;
        sta+=step;
        this.setMovePercent(step);
      }else{
        this.currentPercent=end;
        this.setCurrentPercent();
        this.clearMove();
        this.setActive();
      }
    },10)
  }
  clearMove(){
    clearInterval(this.moveTimer);
    this.moveTimer=null
  }
  dragEnd(){
    let end = Math.round((this.currentPercent/100))*100;
    this.move(this.currentPercent,end)
  }
  autoPlay(){
    this.stopPlay();
    this.clearDelay();
    if(this.fps){
      this.autoTimer=setInterval(()=>{
        this.next();
      },this.fps)
    }
  }
  stopPlay(){
    clearInterval(this.autoTimer);
    this.autoTimer=null;
  }
  delayPlay(){
    this.clearDelay()
    this.delayTimer=setTimeout(()=>{
      this.autoPlay();
      this.clearDelay()
    },3000)
  }
  clearDelay(){
    clearTimeout(this.delayTimer)
    this.delayTimer=null
  }

}
customElements.define("slide-show",SliderShow);