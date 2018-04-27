//
//  ViewController.swift
//  PresentVR
//
//  Created by Reece Jackson on 4/25/18.
//  Copyright © 2018 Aloa. All rights reserved.
//

import UIKit
import Alamofire

enum Emotion {
    case applaud
    case boo
    case laugh
    case cry
    case cheer
    case neutral
}

class ViewController: UIViewController {
    var roomId:String = ""
    var sessionId:String = ""
    var urlString = "http://104.131.9.190"
    //var urlString = "http://localhost"
    
    @IBOutlet weak var roomCodeLabel: UILabel!
    @IBOutlet weak var applaudButton: UIButton!
    @IBOutlet weak var booButton: UIButton!
    @IBOutlet weak var laughButton: UIButton!
    @IBOutlet weak var cryButton: UIButton!
    @IBOutlet weak var cheerButton: UIButton!
    @IBOutlet weak var neutralButton: UIButton!
    
    @IBAction func leaveRoom(_ sender: Any) {
        roomId = ""
        sessionId = ""
        self.performSegue(withIdentifier: "exitRoom", sender: self)
    }
    
    @IBAction func applaud(_ sender: Any) {
        sendEmotion(emotion: .applaud)
    }
    
    @IBAction func boo(_ sender: Any) {
        sendEmotion(emotion: .boo)
    }
    
    @IBAction func laugh(_ sender: Any) {
        sendEmotion(emotion: .laugh)
    }
    
    @IBAction func cry(_ sender: Any) {
        sendEmotion(emotion: .cry)
    }
    
    @IBAction func cheer(_ sender: Any) {
        sendEmotion(emotion: .cheer)
    }
    
    @IBAction func neutral(_ sender: Any) {
        sendEmotion(emotion: .neutral)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        roomCodeLabel.text = "Room code: \(roomId)"
        applaudButton.layer.cornerRadius = 5;
        applaudButton.layer.masksToBounds = true;
        booButton.layer.cornerRadius = 5;
        booButton.layer.masksToBounds = true;
        laughButton.layer.cornerRadius = 5;
        laughButton.layer.masksToBounds = true;
        cryButton.layer.cornerRadius = 5;
        cryButton.layer.masksToBounds = true;
        cheerButton.layer.cornerRadius = 5;
        cheerButton.layer.masksToBounds = true;
        neutralButton.layer.cornerRadius = 5;
        neutralButton.layer.masksToBounds = true;
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    func sendEmotion(emotion: Emotion) {
        let parameters: Parameters = ["emotion": emotionToString(emotion: emotion)]
        Alamofire.request("\(urlString):3000/r/\(sessionId)", method: .post, parameters: parameters, encoding: URLEncoding(destination: .queryString)).responseJSON { response in
            debugPrint(response)
        }
    }
    
    func emotionToString(emotion: Emotion) -> String {
        switch(emotion) {
        case .applaud:
            return "applaud"
        case .boo:
            return "boo"
        case .laugh:
            return "laugh"
        case .cry:
            return "cry"
        case .cheer:
            return "cheer"
        case .neutral:
            return "neutral"
        }
    }
}

