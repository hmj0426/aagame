window.onload = function() {
	var canvas = document.getElementsByTagName("canvas")[0];

	var speed_level1 = 0.0002; // Speed: 0.2 rads (90 degrees) per second
	var speed = speed_level1;
	var init_num_level1 = 7; // Initial number of balls in level 1
	var init_num = init_num_level1; // Initial number of balls

	var score = 0;
	var this_compactness = Number.POSITIVE_INFINITY;
	/*this_compactness is another metric of the game, which means the minimal degree 
		difference between current shooting ball and the existing balls minus 8 degrees. The smaller it is,
		the better this performance is.*/

	var start = document.getElementById("start");
	start.addEventListener("click", function(){ startGame(init_num, speed);});
	var help = document.getElementById("help");
	help.onclick = function(){
		alert("Try to shoot the bottom ball into the gap place of the middle ball!");}
	var restart = document.getElementById("restart");
	restart.addEventListener("click",restartGame);
	var newLev = document.getElementById("newLev");
	newLev.addEventListener("click",newLevel);	
	
	function startGame(init_num,speed) {
		start.style.display = "none"
		help.style.display = "inline"
		
		/*@num: int; number of remaining bottom balls*/
		var num = init_num;
		var start_time = new Date();

		var app = createApp(canvas, start_time);
		var move = setInterval( function(){ createApp(canvas, start_time);}, 5)
		
		canvas.addEventListener("mousedown", app.click);

		//init state: it is a list of degrees of balls
		var balls = [0,40,80,120,160, 200, 240,280,320];

		/*var compactness = 0; */

		var bottomBall_y = 215.28;  //y position of bottom ball
		var on_shoot = false;  // boolean; to see if the bottom ball is moving

		function createApp(canvas, start_time){
			var ctx = canvas.getContext("2d");
			
			var now = new Date();
			var elapse = now.getTime() - start_time.getTime();

			var x_center = canvas.width/2;      // center of ball in the middle
			var y_center = canvas.height*0.37;
			var r_md = canvas.height/2 * 0.18;  //radius of ball in the middle
			var r_sm = 13;  //radius of small ball
			var stick_l = r_md * 2.8; //length of stick

			ctx.save();  //save init state
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.translate(x_center,y_center);
			ctx.strokeStyle = "white";
			ctx.lineWidth = 2;

			drawMiddle();
			drawBottomBall();
			drawMetric();

			function drawMiddle(){
				ctx.fillStyle = "white";
				ctx.beginPath();
				ctx.arc(0, 0, r_md, 0, 2*Math.PI);
				ctx.fill();						
			}

			for(var i in balls) { //degree is of the angle between stick and the bottom vertical line
				var rad = balls[i] * Math.PI / 180;
		   		ctx.save();
		   		ctx.rotate(Math.PI * elapse * speed); 

				var line_x = stick_l * Math.sin(rad);
				var line_y = stick_l * Math.cos(rad);

				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(line_x, line_y);
				ctx.stroke();

				var ball_x = (stick_l + r_sm) * Math.sin(rad);
				var ball_y = (stick_l + r_sm) * Math.cos(rad);

				ctx.beginPath();
				ctx.arc(ball_x, ball_y, r_sm, 0, 2*Math.PI);
				ctx.fillStyle = "white";
				ctx.fill();
				
				ctx.restore();
			}

			function drawBottomBall(){
				if(on_shoot){
					bottomBall_y -= 4;
					if(bottomBall_y <= stick_l + r_sm){
						bottomBall_y = 215.28;
						num--;
						on_shoot = false;
						this_compactness = Number.POSITIVE_INFINITY;

						var current_deg = (elapse * speed * 180) % 360;

						for(i in balls){  
							this_compactness = Math.min(this_compactness, Math.abs(balls[i] - current_deg)-8);
						}

						balls.push(current_deg);

						if(this_compactness < 0){  //judge if the new ball touch the existing balls
								fail();
								return;
						}

						score++;
						/*compactness = (compactness*(init_num-num-1) + this_compactness)/(init_num-num);*/
						/*speed+=0.00001;*/
						
						if(num<1){  // 
							pass();
							return;
						}
					}
				}  //end if(on_shoot)

				ctx.beginPath(); 
				ctx.arc(0, bottomBall_y, r_sm, 0, 2*Math.PI);
				ctx.fill();
				ctx.font = "20px Arial";
				ctx.fillStyle = "black";
				ctx.fillText(num, -6, bottomBall_y + 6)
			} 

			function drawMetric() {
				ctx.font = "20px Arial";
				ctx.fillStyle = "white";
				ctx.fillText("Your Score: " + score, 0.23*canvas.width, -0.3*canvas.height)
				/*ctx.fillText("Compactness Average: " + Math.round(100*compactness)/100, 0.2*canvas.width, -0.25*canvas.height)*/
				ctx.fillText("Compactness: "+ Math.round(100*this_compactness)/100, 0.23*canvas.width,-0.25*canvas.height)
				ctx.font = "14px Arial";
				ctx.fillStyle = "#ffff80";
				ctx.fillText("The smaller is the compactness, ", 0.23*canvas.width, -0.21*canvas.height)
				ctx.fillText("the better your last performance is.", 0.23*canvas.width, -0.18*canvas.height)
				ctx.fillText("But you will lose if the compactness", 0.23*canvas.width, -0.15*canvas.height)
				ctx.fillText("becomes negative.", 0.23*canvas.width, -0.12*canvas.height)
			}

			ctx.restore();  //restore init state

			function click() {
				on_shoot = true;  //will have effect on drawBottomBall()
			}

			function fail() {
				clearInterval(move);
				canvas.style.backgroundColor = "rgb(184,17,28)";
				document.getElementById("result").style.display = "inline";
				document.getElementById("result").innerHTML = "Game Ends! Your final Score: " + score;
				document.getElementById("restart").style.display = "inline";
			}

			function pass(){
				clearInterval(move); 
				canvas.style.backgroundColor = "rgb(28,176,26)";
				document.getElementById("result").style.display = "inline";
				document.getElementById("result").innerHTML = "Level Pass! Your Score: " + score;
				document.getElementById("restart").style.display = "inline";
				document.getElementById("newLev").style.display = "inline";
			}

			return {
				click: click
			}
		} //close createApp()
	}  // close startGame()

	function restartGame(){
		score = 0;
		speed = speed_level1;
		init_num = init_num_level1;
		canvas.style.backgroundColor = "black";
		document.getElementById("restart").style.display = "none";
		document.getElementById("result").style.display = "none";
		document.getElementById("newLev").style.display = "none";
		startGame(init_num_level1, speed_level1); 	
	}

	function newLevel(){
		canvas.style.backgroundColor = "black";
		document.getElementById("restart").style.display = "none";
		document.getElementById("result").style.display = "none";
		document.getElementById("newLev").style.display = "none";
		init_num++;
		speed += 0.00015;
		startGame(init_num, speed);	
	}

	function help() {
		alert("Try to shoot the bottom ball into the gap place of the middle ball!")
	}
}






