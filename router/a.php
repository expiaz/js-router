<?php

$params = $_POST;

$ret = [];

foreach ($params as $key => $param) {
    if($key == 'id')
        $ret['product'] = [
            'id' => $param,
            'type' => 'vaisselle',
            'name' => 'assiette',
            'price' => 57.5
        ];
}

echo json_encode($ret);

exit();