<?php

$params = $_POST;

$ret = [];

if(isset($params['category'])){
    if(isset($params['id'])){
        $ret['id'] = $params['id'];
        $ret['name'] = 'vase';
        $ret['prix'] = 5.42;
        $ret['type'] = 'produit';
    }
    else{
        $ret['category'] = $params['category'];
        $ret['items'] = [
            [
                'id' => 4,
                'name' => 'vase',
                'prix' => 5.42
            ],
            [
                'id' => 7,
                'name' => 'fleures',
                'prix' => 9.53
            ]
        ];
    }
}

echo json_encode($ret);

exit();