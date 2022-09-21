#!/usr/bin/env ruby

# frozen_string_literal: true

require 'bundler/setup'
require 'elevated-flows'
require 'irb'

# IRB.start(__FILE__)

puts 'hello'
flow = ElevatedFlows::FlowParser.new
#flow.parse('./examples/support_escalation.flow')
puts 'ok'