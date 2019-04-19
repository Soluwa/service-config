Feature: Config Service - Create

  @component @debug
  Scenario Outline: Create config <test>
    Given I create a new product with <n> variants
    When I POST to the service
    Then the request succeeds
    When I GET all products
    Then the request succeeds
    And the new product is represented in the response
    When I GET by productId without docs
    Then the request succeeds
    Then all <n> the variants are represented
    Then the productId matches
    Then the route to the variant docs are returned
    When I GET by productId with docs
    Then the request succeeds
    Then all <n> the variants are represented
    Then the productId matches
    Then the content of the config is returned

    Examples:
      | test     | n | productId |
      | Simple   | 1 | cbaas     |
      | Multiple | 2 | cbaas     |