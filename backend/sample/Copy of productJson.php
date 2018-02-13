<?php
header('Content-type: application/json');
$action=$_GET['action'];
if($_GET){
	$db_name     = 'a8494051_bg';
		$db_user     = 'a8494051_bg';
		$db_password = 'Bui1dG@te';
		$server_url  = 'mysql2.000webhost.com';
	$conn=mysql_pconnect($server_url, $db_user, $db_password) or trigger_error(mysql_error(), E_USER_ERROR);
	mysql_select_db($db_name, $conn);
	if($action=="getPType"){
		$query="select distinct pType from product order by pType;";
		$pType_rs=mysql_query($query, $conn) or die(mysql_error());
		$rowCount=mysql_num_rows($pType_rs);
		$count=0;
		if($rowCount>0){
			$row_pType_rs=mysql_fetch_assoc($pType_rs);
			echo '{ "response" : "Success" , "get":[';
				do{
					$count++;
					if ($count==$rowCount){
						echo '{"result":"'.$row_pType_rs['pType'].'"}';
					}else{
						echo '{"result":"'.$row_pType_rs['pType'].'"}, ';
					}
				} while($row_pType_rs=mysql_fetch_assoc($pType_rs));
			echo ']}';
		}else{
			echo '{ "response" : "Fail", "get":[{"result":"Nothing"}]}';	
		}
	}else if($action=="getPCat"){
		$pType=$_GET['pType'];
		if ($pType!=""){
			$query="select distinct pCat from product where pType='$pType' order by pCat;";
			$pCat_rs=mysql_query($query, $conn) or die(mysql_error());
			$rowCount=mysql_num_rows($pCat_rs);
			$count=0;
			if($rowCount>0){
				$row_pCat_rs=mysql_fetch_assoc($pCat_rs);
				echo '{ "response" : "Success", "get":[';
					do{
						$count++;
						if ($count==$rowCount){
							echo '{"result":"'.$row_pCat_rs['pCat'].'"}';
						}else{
							echo '{"result":"'.$row_pCat_rs['pCat'].'"}, ';
						}
					} while($row_pCat_rs=mysql_fetch_assoc($pCat_rs));
				echo ']}';
			}else{
				echo '{ "response" : "Success", "get":[{"result":"Nothing"}]}';	
			}
		}else{
				echo '{ "response" : "Success", "get":[{"result":"Nothing"}]}';	
		}
	}else if($action=="getProduct"){
		$pCat=$_GET['pCat'];
		$pType=$_GET['pType'];
		if ($pCat==""){
			if ($pType==""){
				$query="select pID, pName, pDescription, pPrice, pDiscount, pImgAppSmall, pImgAppBig, pNoInStock from product order by pName;";
			}else{
				$query="select pID, pName, pDescription, pPrice, pDiscount, pImgAppSmall, pImgAppBig, pNoInStock from product where pType='$pType' order by pName;";
			}
		}else if ($pCat!="" && $pType!=""){
			$query="select pID, pName, pDescription, pPrice, pDiscount, pImgAppSmall, pImgAppBig, pNoInStock from product where pCat='$pCat' and pType='$pType' order by pName;";
		}
		$pProduct_rs=mysql_query($query, $conn) or die(mysql_error());
		$rowCount=mysql_num_rows($pProduct_rs);
		$count=0;
		if($rowCount>0){
			$row_pProduct_rs=mysql_fetch_assoc($pProduct_rs);
				echo '{ "response" : "Success" , "get":[';
					do{
						echo '{"pID":'.$row_pProduct_rs['pID'].', ';
						echo '"pName":"'.$row_pProduct_rs['pName'].'", ';
						echo '"pDescription":"'.$row_pProduct_rs['pDescription'].'", ';
						echo '"pPrice":'.$row_pProduct_rs['pPrice'].', ';
						echo '"pDiscount":'.$row_pProduct_rs['pDiscount'].', ';
						$count++;
						$img="http://buildgate.net76.net/".$row_pProduct_rs['pImgAppSmall'];
						
						echo '"pImgAppSmall":"'.$img.'", ';		
						$img="http://buildgate.net76.net/".$row_pProduct_rs['pImgAppBig'];
						
						echo '"pImgAppBig":"'.$img.'", ';					
						if ($count==$rowCount){
							echo '"pNoInStock":'.$row_pProduct_rs['pNoInStock'].'}';
						}else{
							echo '"pNoInStock":'.$row_pProduct_rs['pNoInStock'].'}, ';
						}
					} while($row_pProduct_rs=mysql_fetch_assoc($pProduct_rs));
				echo ']}';
			}else{
				echo '{ "response" : "Success", "get":[{"result":"Nothing"}]}';	
			}
	}else if($action == "checkNoInStock"){	
			$qty=$_GET['qty'];
			$pID=$_GET['pID'];
			$query="select pNoInStock from product where pID=".$pID.";";
			$check_rs=mysql_query($query, $conn) or die(mysql_error());
			$rowCount=mysql_num_rows($check_rs);
			$count=0;
			if($rowCount>0){
				$row_check_rs=mysql_fetch_assoc($check_rs);
				$noInStock=$row_check_rs['pNoInStock'];
				if ($noInStock>=$qty){
					echo '{"response":"Success", "check":"true", "noInStock":'.$noInStock.'}';	
				}else{
					echo '{"response":"Success", "check":"fail", "noInStock":'.$noInStock.'}';	
				}
			}
	}
}

?>