// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockRouter {
    event SwapExecuted(
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOutMin,
        address to
    );

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external {
        // Ստուգում ենք deadline-ը (թեև թեստային է, լավ է նմանակել իրական վարքագիծը)
        require(block.timestamp <= deadline, "MockRouter: EXPIRED");

        require(path.length >= 2, "MockRouter: INVALID_PATH");
        require(to != address(0), "MockRouter: INVALID_TO");

        address tokenIn = path[0];
        address tokenOut = path[1];

        // Ստանում ենք թոկենների հավասար քանակ (թեստային նպատակներով)
        // Իրականում պետք է լինի ավելի բարդ տրամաբանություն, բայց սա բավարար է թեստերի համար
        uint256 amountOut = amountIn; // 1:1 փոխանակում (կամ կարող եք սահմանել ֆիքսված սլիփփինգ)

        require(amountOut >= amountOutMin, "MockRouter: INSUFFICIENT_OUTPUT_AMOUNT");

        // Վերցնում ենք մուտքային թոկենները ուղարկողից
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // Ուղարկում ենք ելքային թոկենները ստացողին
        IERC20(tokenOut).transfer(to, amountOut);

        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOutMin, to);
    }
}