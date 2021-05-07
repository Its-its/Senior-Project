<?php
	if(!isset($_GET['uid']) || !isset($_FILES["fileToUpload"])) {
		echo "ERROR";
		return;
	}

	require "php/conn.php";

	$time = time();

	$uid = $_GET['uid'];

	$result = mysql_query("SELECT * FROM `accounts` WHERE uid='$uid'");
	$rows = mysql_num_rows($result);

	if(!$rows) {
		echo "ERROR";
		mysql_close();
		return;
	}

	$target_dir 	= "";
	$target_file 	= $target_dir . basename($_FILES["fileToUpload"]["name"]);
	$imageFileType 	= pathinfo($target_file,PATHINFO_EXTENSION);

	require "php/namer.php";

	$newName 	= getNewName() . ".$imageFileType";
	$origName 	= basename($_FILES["fileToUpload"]["name"]);

	// Check if image file is a actual image or fake image
	if(isset($_POST["submit"])) {
	    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
	    if($check === true) {
	        echo "ERROR";
			mysql_close();
	        return;
	    }
	}

	// Allow certain file formats
	if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif" ) {
	    echo "ERROR";
		mysql_close();
	    return;
	}

	// Check if file already exists
	for($i = 0; $i < 1000; $i++) {
		if(!file_exists($target_dir . $newName)) {
			break;
		}
		$newName = getNewName() . ".$imageFileType";
	}

    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_dir . $newName)) {
		mysql_query("INSERT INTO `images`(`filename`, `origname`, `added`) VALUES ('$newName','$origName',$time)");
		mysql_close();

		header("Location: $newName");
    } else {
        echo "ERROR";
		mysql_close();
		return;
    }
?>
