Feature: Config Service

  @component
  Scenario Outline: Update Config <test>
    When I GET the <productId> product config with docs
    Given I have updated the config variant document(s)
    When I PUT to the service
    Then the request succeeds
    When I GET the <productId> product config with docs
    Then the variant content changes have been persisted

    Examples:
      | test     | n | productId |
      | Simple   | 1 | cbaas     |
      | Multiple | 2 | cbaas     |


  @component
  Scenario Outline: Update Config fail: missing rev <test>
    When I GET the <productId> products <variantId> variant config
    Then the request succeeds
    When I prepare the same variant document for submission
    Then I remove a _rev from 1 variant document
    When I PUT to the service
    Then I am informed there was a missing _rev

    Examples:
      | test   | n | productId | variantId |
      | Simple | 1 | cbaas     | default   |


  @component
  Scenario Outline: Upsert Config fail: conflict <test>
    When I GET the <productId> products <variantId> variant config
    Then the request succeeds
    Then I prepare the same variant document for submission
    When I PUT to the service
    Then the request succeeds
    When I PUT to the service
    Then I am informed there was a document conflict

    Examples:
      | test   | n | productId | variantId |
      | Simple | 1 | cbaas     | default   |


  @component
  Scenario Outline: Upsert Config <test>
    Given I create a new product with <n> variants
    When I GET by productId with docs
    Given I have updated the config variant document(s)
    Given I have a new config variant document(s) for the productId
    When I PUT to the service with upsert
    Then the request succeeds
    When I GET by productId with docs
    Then the variant content changes have been persisted

    Examples:
      | test     | n |
      | Simple   | 1 |
      | Multiple | 2 |
