/**
 * Sample data for the org chart builder: a made-up company of 62 people.
 * Every name is invented; the surnames are Indian spices, trees and plants,
 * so no one mistakes them for real people.
 *
 * Two deliberate mistakes let the data checks show what they do: one person
 * reports to an ID that isn't in the file, and two people share an ID.
 * The manager column is headed "Reporting Manager" and holds IDs, as many
 * HR system exports do.
 */
import type { Cell } from "../analytics/fields.ts";

export const SAMPLE_HEADERS = ["Emp Code", "Employee Name", "Designation", "Reporting Manager", "Department", "Location"];

const ROWS: [string, string, string, string, string, string][] = [
  ["NK001", "Neela Kesar", "Founder and CEO", "", "Leadership", "Bengaluru"],
  ["NK002", "Arjun Elaichi", "Chief of staff", "NK001", "Leadership", "Bengaluru"],

  ["NK010", "Tara Amaltas", "Chief technology officer", "NK001", "Engineering", "Bengaluru"],
  ["NK011", "Kabir Dalchini", "Engineering manager, payments", "NK010", "Engineering", "Bengaluru"],
  ["NK012", "Asha Pudina", "Senior software engineer", "NK011", "Engineering", "Bengaluru"],
  ["NK013", "Rohit Javitri", "Software engineer", "NK011", "Engineering", "Bengaluru"],
  ["NK014", "Meghna Anardana", "Software engineer", "NK011", "Engineering", "Pune"],
  ["NK015", "Yusuf Kalonji", "Software engineer", "NK011", "Engineering", "Bengaluru"],
  ["NK016", "Diya Hing", "Quality engineer", "NK011", "Engineering", "Bengaluru"],
  ["NK017", "Pranav Laung", "Software engineer", "NK011", "Engineering", "Bengaluru"],
  ["NK020", "Ira Gulmohar", "Engineering manager, mobile", "NK010", "Engineering", "Pune"],
  ["NK021", "Sahil Chameli", "Senior mobile engineer", "NK020", "Engineering", "Pune"],
  ["NK022", "Nisha Mogra", "Mobile engineer", "NK020", "Engineering", "Pune"],
  ["NK023", "Aman Kokum", "Mobile engineer", "NK020", "Engineering", "Pune"],
  ["NK024", "Ritu Saunth", "Mobile engineer", "NK020", "Engineering", "Pune"],
  ["NK025", "Joel Amchur", "Mobile engineer", "NK020", "Engineering", "Kochi"],
  ["NK016", "Lata Chirata", "Quality engineer", "NK020", "Engineering", "Pune"],
  ["NK030", "Dev Jamun", "Engineering manager, platform", "NK010", "Engineering", "Pune"],
  ["NK031", "Rhea Kachnar", "Staff engineer", "NK030", "Engineering", "Pune"],

  ["NK040", "Mira Palash", "Head of product", "NK001", "Product", "Bengaluru"],
  ["NK041", "Kunal Ashoka", "Product manager", "NK040", "Product", "Bengaluru"],
  ["NK042", "Leena Shirish", "Product manager", "NK040", "Product", "Bengaluru"],
  ["NK043", "Farah Bakul", "Product manager", "NK040", "Product", "Pune"],
  ["NK044", "Tenzin Mahua", "Product designer", "NK040", "Product", "Bengaluru"],
  ["NK099", "Kiran Rajgira", "Contract designer", "NK045", "Product", "Bengaluru"],

  ["NK050", "Vikram Saunf", "Head of sales", "NK001", "Sales", "Mumbai"],
  ["NK051", "Leela Ajwain", "Regional sales manager, west", "NK050", "Sales", "Mumbai"],
  ["NK052", "Harpreet Jeera", "Sales executive", "NK051", "Sales", "Mumbai"],
  ["NK053", "Imran Dhaniya", "Sales executive", "NK051", "Sales", "Mumbai"],
  ["NK054", "Kavita Tejpatta", "Sales executive", "NK051", "Sales", "Pune"],
  ["NK055", "Manav Kasuri", "Sales executive", "NK051", "Sales", "Mumbai"],
  ["NK056", "Noor Kalimirch", "Sales executive", "NK051", "Sales", "Mumbai"],
  ["NK057", "Ojas Mulethi", "Sales executive", "NK051", "Sales", "Pune"],
  ["NK058", "Pallavi Khus", "Sales executive", "NK051", "Sales", "Mumbai"],
  ["NK059", "Qasim Chakriphool", "Sales executive", "NK051", "Sales", "Mumbai"],
  ["NK060", "Radha Parijat", "Senior sales executive", "NK051", "Sales", "Mumbai"],
  ["NK061", "Sunil Semal", "Sales executive", "NK051", "Sales", "Pune"],
  ["NK062", "Uma Bargad", "Sales executive", "NK051", "Sales", "Mumbai"],
  ["NK063", "Varun Harsingar", "Sales executive", "NK051", "Sales", "Mumbai"],
  ["NK065", "Rohan Methi", "Regional sales manager, north", "NK050", "Sales", "Delhi"],
  ["NK066", "Simran Karanj", "Sales executive", "NK065", "Sales", "Delhi"],
  ["NK067", "Tarun Shisham", "Sales executive", "NK065", "Sales", "Delhi"],
  ["NK068", "Yamini Babool", "Sales executive", "NK065", "Sales", "Delhi"],
  ["NK069", "Zubin Kikar", "Sales executive", "NK065", "Sales", "Delhi"],

  ["NK070", "Anaya Neem", "Head of people", "NK001", "People", "Bengaluru"],
  ["NK071", "Zoya Peepal", "HR business partner", "NK070", "People", "Mumbai"],
  ["NK072", "Farhan Champa", "Talent acquisition lead", "NK070", "People", "Bengaluru"],
  ["NK073", "Gita Supari", "Recruiter", "NK072", "People", "Bengaluru"],
  ["NK074", "Hari Kewda", "Recruiter", "NK072", "People", "Pune"],

  ["NK080", "Sameer Imli", "Chief financial officer", "NK001", "Finance", "Mumbai"],
  ["NK081", "Pooja Jaiphal", "Finance manager", "NK080", "Finance", "Mumbai"],
  ["NK082", "Rafiq Chironji", "Accountant", "NK081", "Finance", "Mumbai"],
  ["NK083", "Sneha Lajwanti", "Accountant", "NK081", "Finance", "Mumbai"],
  ["NK084", "Ved Ritha", "Payroll executive", "NK081", "Finance", "Bengaluru"],

  ["NK090", "Kavya Kadamba", "Head of customer support", "NK001", "Customer support", "Kochi"],
  ["NK091", "Abhay Nagkesar", "Support specialist", "NK090", "Customer support", "Kochi"],
  ["NK092", "Bhavna Ber", "Support specialist", "NK090", "Customer support", "Kochi"],
  ["NK093", "Chetan Aonla", "Support specialist", "NK090", "Customer support", "Kochi"],
  ["NK094", "Deepa Kamrakh", "Support specialist", "NK090", "Customer support", "Kochi"],
  ["NK095", "Elan Shahtoot", "Support specialist", "NK090", "Customer support", "Kochi"],
  ["NK096", "Fatima Phalsa", "Support specialist", "NK090", "Customer support", "Kochi"],
  ["NK097", "Girish Karonda", "Support specialist", "NK090", "Customer support", "Kochi"]
];

export function sampleOrgTable(): { headers: string[]; rows: Cell[][] } {
  return { headers: [...SAMPLE_HEADERS], rows: ROWS.map((r) => [...r]) };
}
