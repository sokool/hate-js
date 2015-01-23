<?php
return [
    'mintsoft'     => [
        'hate-js' => [

        ],
    ],
    'view_manager' => array(
        'mvc_strategies' => [
            'MintSoft\HateJS\Loader',
        ],
        'strategies' => array(
            'ViewJsonStrategy',
        ),
    ),
];