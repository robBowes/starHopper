enemyImageGenerator = () => {
    let offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = ENEMY_BASE_RADIUS * 2 + 10;
    offScreenCanvas.height = ENEMY_BASE_RADIUS * 2 + 10;
    let offScreenContext = offScreenCanvas.getContext('2d');
    offScreenContext.lineWidth = 8;
    offScreenContext.strokeStyle = color.red;
    offScreenContext.shadowBlur = 10;
    offScreenContext.shadowColor = color.red;
    offScreenContext.fillStyle = color.red;
    offScreenContext.translate(offScreenCanvas.width / 2, offScreenCanvas.width / 2);
    offScreenContext.beginPath();
    offScreenContext.arc(0, 0, 50, 0, 2 * Math.PI);
    offScreenContext.stroke();
    // this.c.fill();
    return offScreenCanvas.toDataURL('enemy/png');
}

sparksGenerator = () => {
    let offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = 240;
    offScreenCanvas.height = 80;
    let offScreenContext = offScreenCanvas.getContext('2d');
    offScreenContext.lineWidth = 2;
    offScreenContext.strokeStyle = color.yellow;
    offScreenContext.shadowColor = color.yellow;
    offScreenContext.shadowBlur = 10;
    offScreenContext.beginPath();
    for (let j = 0; j <= 3; j++) {
        offScreenContext.save()
        offScreenContext.translate(40 + j * 80, 40);
        for (let index = 0; index < 10; index++) {
            offScreenContext.moveTo(0, 20);
            offScreenContext.lineTo(0, 40);
            offScreenContext.moveTo(0, -40);
            offScreenContext.rotate(Math.PI * 2 / 10 + j);
        }
        offScreenContext.restore();
    }
    offScreenContext.stroke();
    return offScreenCanvas.toDataURL('spark/png')
}

explosionGenerator = () => {
    let offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = 600;
    offScreenCanvas.height = 200;
    let offScreenContext = offScreenCanvas.getContext('2d');
    offScreenContext.lineWidth = 2;
    offScreenContext.strokeStyle = color.orange;
    offScreenContext.shadowColor = color.orange;
    offScreenContext.fillStyle = color.orange;
    offScreenContext.shadowBlur = 10;
    offScreenContext.beginPath();
    for (let j = 0; j <= 3; j++) {
        offScreenContext.save()
        offScreenContext.translate(100 + j * 200, 100);
        offScreenContext.arc(0, 0, ENEMY_BASE_RADIUS - 20 + j * 10, 0, Math.PI * 2)
        offScreenContext.fill()
        offScreenContext.beginPath();
        for (let index = 0; index < 20; index++) {
            offScreenContext.moveTo(0, 20 + 20 * j);
            offScreenContext.lineTo(0, 40 + 20 * j);
            offScreenContext.moveTo(0, -40 + 20 * j);
            offScreenContext.rotate(Math.PI * 2 / 20);
        }
        offScreenContext.restore();
        offScreenContext.stroke();
    }
    return offScreenCanvas.toDataURL('explosion/png')
}

playerGenerator= () => {
    let offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = 100;
    offScreenCanvas.height = 100;
    let offScreenContext = offScreenCanvas.getContext('2d');
    offScreenContext.strokeStyle = color.blue
    offScreenContext.shadowColor = color.blue
    offScreenContext.fillStyle = color.blue;
    offScreenContext.lineCap = 'round';
    offScreenContext.shadowBlur = 10;
    offScreenContext.lineWidth = 4;
    offScreenContext.translate(50, 25)
    offScreenContext.save();
    for (let i = -1; i < 2; i += 2) {
        offScreenContext.moveTo(0, 0); // tip
        offScreenContext.lineTo(10 * i, 10) // first edge
        offScreenContext.lineTo(15 * i, 35) // bend of wing
        offScreenContext.lineTo(35 * i, 45) // tip of wing
        offScreenContext.lineTo(35 * i, 20) // tip of gun
        offScreenContext.lineTo(35 * i, 60) // rear of gun
        offScreenContext.lineTo(35 * i, 60) // tip of wing
        offScreenContext.lineTo(12 * i, 55) // bend of wing
        offScreenContext.lineTo(14 * i, 70) // edge of engine
        offScreenContext.lineTo(0 * i, 70) // middle of engine
        offScreenContext.lineTo(5 * i, 70) // middle of engine
        offScreenContext.moveTo(0 * i, 15) //move to window
        offScreenContext.lineTo(10 * i, 10)
        offScreenContext.moveTo(28 * i, 58)//move to wing
        offScreenContext.lineTo(28 * i, 43)

    }
    offScreenContext.stroke()
    // offScreenContext.fill();
    offScreenContext.restore();
    return offScreenCanvas.toDataURL('ship/png');
}

bulletGenerator = () => {
    let offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = 20;
    offScreenCanvas.height = 20;
    let offScreenContext = offScreenCanvas.getContext('2d');
    offScreenContext.lineWidth = 2;
    offScreenContext.strokeStyle = 'white';
    offScreenContext.shadowColor = 'white';
    offScreenContext.fillStyle = 'white';
    offScreenContext.shadowBlur = 3;
    offScreenContext.translate(10, 10);
    offScreenContext.beginPath();
    offScreenContext.lineTo(0, 0);
    offScreenContext.lineTo(-3, 5);
    offScreenContext.lineTo(3, 5);
    offScreenContext.lineTo(0, 0);
    offScreenContext.stroke();
    offScreenContext.fill();
    return offScreenCanvas.toDataURL('bullet/png')
}


powerUpGenerator = () => {
    let offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = 50;
    offScreenCanvas.height = 50;
    let offScreenContext = offScreenCanvas.getContext('2d');
    offScreenContext.lineWidth = 4;
    offScreenContext.strokeStyle = color.green;
    offScreenContext.shadowBlur = 10;
    offScreenContext.shadowColor = color.green;
    offScreenContext.fillStyle = color.green;
    offScreenContext.translate(25, 25);
    offScreenContext.beginPath();
    offScreenContext.arc(0, 0, 20, 0, 2 * Math.PI);
    offScreenContext.stroke();
    offScreenContext.fill();
    return offScreenCanvas.toDataURL('powerup/png');
}